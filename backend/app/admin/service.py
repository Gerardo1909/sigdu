from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, UserRole
from app.catalog.models import Discipline, Venue
from app.tenant.models import Institution
from app.admin.schemas import (
    CreateDisciplineRequest,
    CreateVenueRequest,
    PaginatedUsersResponse,
    UpdateInstitutionRequest,
    UpdateRoleRequest,
    UserAdminResponse,
)


# ── Disciplines ──────────────────────────────────────────────────────────────


async def create_discipline(
    db: AsyncSession, data: CreateDisciplineRequest
) -> Discipline:
    existing = await db.scalar(select(Discipline).where(Discipline.name == data.name))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una disciplina con ese nombre",
        )
    discipline = Discipline(
        id=str(uuid4()),
        name=data.name,
        description=data.description,
    )
    db.add(discipline)
    await db.commit()
    await db.refresh(discipline)
    return discipline


async def list_disciplines(db: AsyncSession) -> list[Discipline]:
    result = await db.execute(select(Discipline).order_by(Discipline.name))
    return list(result.scalars().all())


async def delete_discipline(db: AsyncSession, discipline_id: str) -> None:
    discipline = await db.scalar(
        select(Discipline).where(Discipline.id == discipline_id)
    )
    if not discipline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Disciplina no encontrada"
        )
    await db.delete(discipline)
    await db.commit()


# ── Venues ───────────────────────────────────────────────────────────────────


async def create_venue(db: AsyncSession, data: CreateVenueRequest) -> Venue:
    venue = Venue(
        id=str(uuid4()),
        name=data.name,
        address=data.address,
        capacity=data.capacity,
    )
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


async def list_venues(db: AsyncSession) -> list[Venue]:
    result = await db.execute(select(Venue).order_by(Venue.name))
    return list(result.scalars().all())


async def delete_venue(db: AsyncSession, venue_id: str) -> None:
    venue = await db.scalar(select(Venue).where(Venue.id == venue_id))
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada"
        )
    await db.delete(venue)
    await db.commit()


# ── Users ────────────────────────────────────────────────────────────────────


async def list_users(
    db: AsyncSession,
    search: str | None,
    role: str | None,
    page: int,
    limit: int,
) -> PaginatedUsersResponse:
    query = select(User).order_by(User.full_name)

    if search:
        query = query.where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )
    if role:
        query = query.where(User.role == role)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    users = result.scalars().all()

    return PaginatedUsersResponse(
        items=[UserAdminResponse.model_validate(u) for u in users],
        total=total,
        page=page,
    )


async def update_user_role(
    db: AsyncSession, user_id: str, data: UpdateRoleRequest
) -> User:
    # Validate role
    valid_roles = {r.value for r in UserRole}
    if data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles válidos: {', '.join(valid_roles)}",
        )

    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    user.role = UserRole(data.role)
    await db.commit()
    await db.refresh(user)
    return user


# ── Institution ───────────────────────────────────────────────────────────────


async def get_institution(db: AsyncSession) -> Institution:
    institution = await db.scalar(
        select(Institution).where(Institution.slug == "unsam")
    )
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institución no encontrada",
        )
    return institution


async def update_institution(
    db: AsyncSession, data: UpdateInstitutionRequest
) -> Institution:
    institution = await get_institution(db)

    if data.name is not None:
        institution.name = data.name
    if data.contact_email is not None:
        institution.contact_email = data.contact_email
    if data.contact_phone is not None:
        institution.contact_phone = data.contact_phone

    await db.commit()
    await db.refresh(institution)
    return institution
