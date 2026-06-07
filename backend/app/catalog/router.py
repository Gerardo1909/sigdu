from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.catalog import schemas, service

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/activities", response_model=schemas.ActivityListResponse)
async def list_activities(
    discipline: str | None = Query(None, description="Filtrar por ID de disciplina"),
    venue: str | None = Query(None, description="Filtrar por ID de sede"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Elementos por página"),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_activities(db, discipline_id=discipline, venue_id=venue, page=page, limit=limit)


@router.get("/activities/{activity_id}", response_model=schemas.ActivityDetail)
async def get_activity(activity_id: str, db: AsyncSession = Depends(get_db)):
    return await service.get_activity(db, activity_id)


@router.get("/disciplines", response_model=list[schemas.DisciplineResponse])
async def list_disciplines(db: AsyncSession = Depends(get_db)):
    return await service.list_disciplines(db)


@router.get("/venues", response_model=list[schemas.VenueResponse])
async def list_venues(db: AsyncSession = Depends(get_db)):
    return await service.list_venues(db)
