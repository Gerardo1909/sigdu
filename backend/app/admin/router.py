from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.schemas import DisciplineResponse, VenueResponse
from app.database import get_db
from app.dependencies import require_role
from app.admin import schemas, service

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# ── Disciplines ──────────────────────────────────────────────────────────────


@router.post(
    "/disciplines",
    response_model=DisciplineResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_discipline(
    body: schemas.CreateDisciplineRequest,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.create_discipline(db, body)


@router.get("/disciplines", response_model=list[DisciplineResponse])
async def list_disciplines(
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_disciplines(db)


@router.delete("/disciplines/{discipline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discipline(
    discipline_id: str,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_discipline(db, discipline_id)


# ── Venues ───────────────────────────────────────────────────────────────────


@router.post(
    "/venues",
    response_model=VenueResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_venue(
    body: schemas.CreateVenueRequest,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.create_venue(db, body)


@router.get("/venues", response_model=list[VenueResponse])
async def list_venues(
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_venues(db)


@router.delete("/venues/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_venue(
    venue_id: str,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_venue(db, venue_id)


# ── Users ────────────────────────────────────────────────────────────────────


@router.get("/users", response_model=schemas.PaginatedUsersResponse)
async def list_users(
    search: str | None = Query(None, description="Buscar por nombre o email"),
    role: str | None = Query(None, description="Filtrar por rol"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_users(db, search, role, page, limit)


@router.patch("/users/{user_id}/role", response_model=schemas.UserAdminResponse)
async def update_user_role(
    user_id: str,
    body: schemas.UpdateRoleRequest,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.update_user_role(db, user_id, body)


# ── Institution ───────────────────────────────────────────────────────────────


@router.get("/institution", response_model=schemas.InstitutionConfig)
async def get_institution(
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_institution(db)


@router.put("/institution", response_model=schemas.InstitutionConfig)
async def update_institution(
    body: schemas.UpdateInstitutionRequest,
    token_data=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await service.update_institution(db, body)
