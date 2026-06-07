from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.enrollment import schemas, service

router = APIRouter(prefix="/api/v1/enrollments", tags=["enrollment"])


@router.post(
    "", response_model=schemas.EnrollResponse, status_code=status.HTTP_201_CREATED
)
async def enroll(
    body: schemas.EnrollRequest,
    token_data=Depends(require_role("alumno")),
    db: AsyncSession = Depends(get_db),
):
    try:
        enrollment = await service.enroll_user(db, token_data.sub, body.activity_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Build response with activity name (loaded via relationship)
    from app.catalog.models import Activity
    from sqlalchemy import select

    activity = await db.scalar(
        select(Activity).where(Activity.id == enrollment.activity_id)
    )
    return schemas.EnrollResponse(
        id=enrollment.id,
        activity_id=enrollment.activity_id,
        activity_name=activity.name if activity else "",
        status=enrollment.status,
        enrolled_at=enrollment.enrolled_at,
    )


@router.get("/me", response_model=schemas.MyEnrollmentsResponse)
async def my_enrollments(
    token_data=Depends(require_role("alumno")),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_my_enrollments(db, token_data.sub)
