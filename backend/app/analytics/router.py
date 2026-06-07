from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics import service
from app.analytics.schemas import AnalyticsDashboardResponse
from app.database import get_db
from app.dependencies import require_role

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def get_dashboard(
    discipline_id: str | None = Query(None, description="Filtrar por disciplina"),
    token_data=Depends(require_role("directivo")),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_dashboard(db, discipline_id=discipline_id)


@router.get("/export")
async def export_dashboard(
    discipline_id: str | None = Query(None, description="Filtrar por disciplina"),
    token_data=Depends(require_role("directivo")),
    db: AsyncSession = Depends(get_db),
):
    content = await service.export_dashboard(db, discipline_id=discipline_id)
    return StreamingResponse(
        iter([content]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="sigdu_analytics.xlsx"'},
    )
