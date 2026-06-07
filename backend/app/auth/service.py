from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from uuid import uuid4

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.auth.models import User, UserRole
from app.auth.schemas import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALLOWED_DOMAINS = ["unsam.edu.ar", "estudiantes.unsam.edu.ar", "demo.sigdu.com"]


def _validate_domain(email: str) -> None:
    domain = email.split("@")[-1].lower()
    if domain not in ALLOWED_DOMAINS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dominio de email no permitido. Dominios válidos: {', '.join(ALLOWED_DOMAINS)}",
        )


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    role: UserRole = UserRole.alumno,
) -> User:
    _validate_domain(email)

    existing = await db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    user = User(
        id=str(uuid4()),
        email=email,
        hashed_password=_hash_password(password),
        full_name=full_name,
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await db.scalar(select(User).where(User.email == email))
    if not user or not _verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo",
        )
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    return user


def _get_tenant_from_email(email: str) -> str:
    domain = email.split("@")[-1].lower()
    domain_tenant_map = {
        "unsam.edu.ar": "unsam",
        "estudiantes.unsam.edu.ar": "unsam",
        "demo.sigdu.com": "unsam",
    }
    return domain_tenant_map.get(domain, "unsam")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode["exp"] = expire
    to_encode["type"] = "refresh"
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def decode_token(token: str, require_type: str | None = None) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        role: str | None = payload.get("role")
        tenant: str | None = payload.get("tenant")
        if sub is None or email is None or role is None:
            raise credentials_exception
        if require_type is not None and payload.get("type") != require_type:
            raise credentials_exception
        return TokenData(sub=sub, email=email, role=role, tenant=tenant or "unsam")
    except JWTError:
        raise credentials_exception


async def forgot_password(db: AsyncSession, email: str) -> None:
    user = await db.scalar(select(User).where(User.email == email))
    if user:
        reset_token = token_urlsafe(32)
        print(f"[EMAIL] Password reset token for {email}: {reset_token}")
        print(f"[EMAIL] Reset URL: http://localhost:3000/reset-password?token={reset_token}")
