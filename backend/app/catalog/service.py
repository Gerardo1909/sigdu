from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.catalog.models import Activity, Discipline, Enrollment, Venue
from app.catalog.schemas import ActivityDetail, ActivityListItem, ActivityListResponse


async def list_disciplines(db: AsyncSession) -> list[Discipline]:
    result = await db.execute(select(Discipline).order_by(Discipline.name))
    return list(result.scalars().all())


async def list_venues(db: AsyncSession) -> list[Venue]:
    result = await db.execute(select(Venue).order_by(Venue.name))
    return list(result.scalars().all())


async def list_activities(
    db: AsyncSession,
    discipline_id: str | None = None,
    venue_id: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> ActivityListResponse:
    base_query = (
        select(Activity)
        .options(
            selectinload(Activity.discipline),
            selectinload(Activity.venue),
            selectinload(Activity.professor),
            selectinload(Activity.enrollments),
        )
        .order_by(Activity.name)
    )

    if discipline_id:
        base_query = base_query.where(Activity.discipline_id == discipline_id)
    if venue_id:
        base_query = base_query.where(Activity.venue_id == venue_id)

    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    paginated = base_query.offset(offset).limit(limit)
    result = await db.execute(paginated)
    activities = result.scalars().all()

    items = [
        ActivityListItem(
            id=a.id,
            name=a.name,
            discipline=a.discipline.name,
            venue=a.venue.name,
            schedule_description=a.schedule_description,
            capacity=a.capacity,
            enrolled_count=len(a.enrollments),
        )
        for a in activities
    ]

    return ActivityListResponse(items=items, total=total, page=page)


async def get_activity(db: AsyncSession, activity_id: str) -> ActivityDetail:
    result = await db.execute(
        select(Activity)
        .where(Activity.id == activity_id)
        .options(
            selectinload(Activity.discipline),
            selectinload(Activity.venue),
            selectinload(Activity.professor),
            selectinload(Activity.enrollments),
        )
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada")

    professor_name = activity.professor.full_name if activity.professor else None

    return ActivityDetail(
        id=activity.id,
        name=activity.name,
        description=activity.description,
        discipline=activity.discipline.name,
        discipline_id=activity.discipline_id,
        venue=activity.venue.name,
        venue_id=activity.venue_id,
        schedule_description=activity.schedule_description,
        capacity=activity.capacity,
        enrolled_count=len(activity.enrollments),
        professor_name=professor_name,
    )
