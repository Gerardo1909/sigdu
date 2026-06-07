import json
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, UserRole
from app.auth.service import _hash_password
from app.setup.schemas import SetupInstitutionRequest, SetupInstitutionResponse
from app.tenant.models import Institution


async def create_institution_with_admin(
    db: AsyncSession,
    request: SetupInstitutionRequest,
) -> SetupInstitutionResponse:
    # Verificar que no exista una institución con ese slug en shared.institutions
    existing = await db.scalar(
        select(Institution).where(Institution.slug == request.slug)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Institución ya registrada",
        )

    institution_id = str(uuid4())
    email_domains_str = json.dumps(request.email_domains)

    institution = Institution(
        id=institution_id,
        name=request.name,
        slug=request.slug,
        email_domains=email_domains_str,
        contact_email=request.admin_email,
        logo_url=None,
        contact_phone=None,
    )
    db.add(institution)
    await db.flush()

    # Crear usuario admin en el schema del tenant
    admin_user_id = str(uuid4())
    admin_user = User(
        id=admin_user_id,
        email=request.admin_email,
        hashed_password=_hash_password(request.admin_password),
        full_name=request.admin_full_name,
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin_user)
    await db.commit()

    print(f"[EMAIL] Bienvenido a SIGDU: cuenta admin creada para {request.admin_email}")

    return SetupInstitutionResponse(
        institution_id=institution_id,
        admin_user_id=admin_user_id,
        message=f"Institución '{request.name}' creada exitosamente con usuario admin.",
    )
