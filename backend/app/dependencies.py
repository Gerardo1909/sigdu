from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)

ROLE_HIERARCHY = {
    "super_admin": 5,
    "admin": 4,
    "directivo": 3,
    "profesor": 2,
    "alumno": 1,
}


async def get_db():
    from app.database import get_db as _get_db
    async for session in _get_db():
        yield session


def require_role(minimum_role: str):
    async def dependency(
        credentials: HTTPAuthorizationCredentials | None = Depends(security),
    ):
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token requerido",
            )
        from app.auth.service import decode_token
        token_data = await decode_token(credentials.credentials)
        user_level = ROLE_HIERARCHY.get(token_data.role, 0)
        required_level = ROLE_HIERARCHY.get(minimum_role, 0)
        if user_level < required_level:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes")
        return token_data

    return dependency
