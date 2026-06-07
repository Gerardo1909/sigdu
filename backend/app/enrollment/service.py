from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.catalog.models import Activity, Enrollment, EnrollmentStatus
from app.enrollment.schemas import EnrollResponse, MyEnrollmentsResponse


async def enroll_user(db: AsyncSession, user_id: str, activity_id: str) -> Enrollment:
    # 1. Verificar que la actividad existe
    activity = await db.scalar(select(Activity).where(Activity.id == activity_id))
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada",
        )

    # 2. Contar inscripciones activas y comparar con capacity
    count = (
        await db.scalar(
            select(func.count())
            .select_from(Enrollment)
            .where(
                Enrollment.activity_id == activity_id,
                Enrollment.status == EnrollmentStatus.active.value,
            )
        )
        or 0
    )
    if count >= activity.capacity:
        raise ValueError("Cupo completo")

    # 3. Verificar que el usuario no esté ya inscripto
    existing = await db.scalar(
        select(Enrollment).where(
            Enrollment.activity_id == activity_id,
            Enrollment.user_id == user_id,
            Enrollment.status == EnrollmentStatus.active.value,
        )
    )
    if existing:
        raise ValueError("Ya estás inscripto en esta actividad")

    # 4. Crear Enrollment
    enrollment = Enrollment(
        id=str(uuid4()),
        activity_id=activity_id,
        user_id=user_id,
        status=EnrollmentStatus.active.value,
    )
    db.add(enrollment)

    # 5. Email console log
    print(f"[EMAIL] Confirmacion de inscripcion enviada a user_id={user_id}")

    # 6. Commit y refresh
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


async def get_my_enrollments(db: AsyncSession, user_id: str) -> MyEnrollmentsResponse:
    result = await db.execute(
        select(Enrollment)
        .where(
            Enrollment.user_id == user_id,
            Enrollment.status == EnrollmentStatus.active.value,
        )
        .options(selectinload(Enrollment.activity))
        .order_by(Enrollment.enrolled_at.desc())
    )
    enrollments = result.scalars().all()

    items = [
        EnrollResponse(
            id=e.id,
            activity_id=e.activity_id,
            activity_name=e.activity.name,
            status=e.status,
            enrolled_at=e.enrolled_at,
        )
        for e in enrollments
    ]

    return MyEnrollmentsResponse(enrollments=items, total=len(items))
