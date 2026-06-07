from datetime import date as date_type
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.attendance.models import AttendanceRecord, ClassSession
from app.attendance.schemas import (
    AttendanceSummary,
    BulkAttendanceRequest,
    ClassSessionResponse,
    EnrolledStudent,
)
from app.catalog.models import Activity, Enrollment, EnrollmentStatus
from app.auth.models import User


async def get_today_sessions(
    db: AsyncSession, professor_id: str
) -> list[ClassSessionResponse]:
    today = date_type.today()

    # Get activities where this professor is assigned
    activities_result = await db.execute(
        select(Activity)
        .where(Activity.professor_id == professor_id)
        .options(selectinload(Activity.enrollments))
    )
    activities = activities_result.scalars().all()

    if not activities:
        return []

    activity_ids = [a.id for a in activities]

    # Find existing sessions for today
    sessions_result = await db.execute(
        select(ClassSession)
        .where(
            ClassSession.date == today,
            ClassSession.activity_id.in_(activity_ids),
        )
        .options(selectinload(ClassSession.activity))
    )
    existing_sessions = sessions_result.scalars().all()
    existing_activity_ids = {s.activity_id for s in existing_sessions}

    # Create on-demand sessions for activities that have enrollments but no session today
    new_sessions: list[ClassSession] = []
    for activity in activities:
        active_enrollments = [
            e for e in activity.enrollments if e.status == EnrollmentStatus.active.value
        ]
        if activity.id not in existing_activity_ids and active_enrollments:
            session = ClassSession(
                id=str(uuid4()),
                activity_id=activity.id,
                date=today,
                created_by=professor_id,
            )
            db.add(session)
            new_sessions.append(session)

    if new_sessions:
        await db.commit()
        for s in new_sessions:
            await db.refresh(s)

    all_sessions = list(existing_sessions) + new_sessions

    # Build responses with enrolled students
    responses: list[ClassSessionResponse] = []
    for session in all_sessions:
        # Load activity if not already loaded
        activity_result = await db.execute(
            select(Activity).where(Activity.id == session.activity_id)
        )
        activity = activity_result.scalar_one_or_none()
        activity_name = activity.name if activity else ""

        # Get active enrollments with user data
        enrolled_result = await db.execute(
            select(Enrollment, User)
            .join(User, Enrollment.user_id == User.id)
            .where(
                Enrollment.activity_id == session.activity_id,
                Enrollment.status == EnrollmentStatus.active.value,
            )
        )
        rows = enrolled_result.all()
        enrolled_students = [
            EnrolledStudent(
                user_id=user.id,
                full_name=user.full_name,
                email=user.email,
            )
            for _, user in rows
        ]

        responses.append(
            ClassSessionResponse(
                id=session.id,
                activity_id=session.activity_id,
                activity_name=activity_name,
                date=session.date,
                enrolled_students=enrolled_students,
            )
        )

    return responses


async def bulk_attendance(
    db: AsyncSession,
    professor_id: str,
    request: BulkAttendanceRequest,
) -> AttendanceSummary:
    # Verify session exists
    session = await db.scalar(
        select(ClassSession).where(ClassSession.id == request.class_session_id)
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión de clase no encontrada",
        )

    if session.created_by != professor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para modificar esta sesión",
        )

    # Upsert each attendance record
    for record in request.records:
        existing = await db.scalar(
            select(AttendanceRecord).where(
                AttendanceRecord.class_session_id == request.class_session_id,
                AttendanceRecord.user_id == record.user_id,
            )
        )
        if existing:
            existing.present = record.present
        else:
            new_record = AttendanceRecord(
                id=str(uuid4()),
                class_session_id=request.class_session_id,
                user_id=record.user_id,
                present=record.present,
            )
            db.add(new_record)

    await db.commit()

    total = len(request.records)
    present = sum(1 for r in request.records if r.present)
    absent = total - present
    percentage = round((present / total * 100) if total > 0 else 0.0, 2)

    return AttendanceSummary(
        total=total,
        present=present,
        absent=absent,
        percentage=percentage,
    )
