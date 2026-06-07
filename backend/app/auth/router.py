from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.auth import schemas, service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: schemas.RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await service.create_user(db, body.email, body.password, body.full_name)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
async def login(body: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await service.authenticate_user(db, body.email, body.password)
    tenant = service._get_tenant_from_email(user.email)
    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "tenant": tenant,
    }
    access_token = service.create_access_token(token_payload)
    refresh_token = service.create_refresh_token(token_payload)
    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/forgot-password")
async def forgot_password(body: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await service.forgot_password(db, body.email)
    return {"message": "Si el email existe, recibirá instrucciones para restablecer su contraseña"}


@router.post("/refresh")
async def refresh_token(body: schemas.RefreshRequest):
    token_data = await service.decode_token(body.refresh_token, require_type="refresh")
    new_payload = {
        "sub": token_data.sub,
        "email": token_data.email,
        "role": token_data.role,
        "tenant": token_data.tenant,
    }
    new_access_token = service.create_access_token(new_payload)
    return {"access_token": new_access_token}


@router.get("/me", response_model=schemas.UserResponse)
async def me(token_data=Depends(require_role("alumno")), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.auth.models import User

    user = await db.scalar(select(User).where(User.id == token_data.sub))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user
