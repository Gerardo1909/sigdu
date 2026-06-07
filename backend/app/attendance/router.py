from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.attendance import schemas, service

router = APIRouter(prefix="/api/v1", tags=["attendance"])


@router.get("/classes/today", response_model=list[schemas.ClassSessionResponse])
async def get_today_classes(
    token_data=Depends(require_role("profesor")),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_today_sessions(db, token_data.sub)


@router.post("/attendance/bulk", response_model=schemas.AttendanceSummary)
async def bulk_attendance(
    body: schemas.BulkAttendanceRequest,
    token_data=Depends(require_role("profesor")),
    db: AsyncSession = Depends(get_db),
):
    return await service.bulk_attendance(db, token_data.sub, body)
