from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.tenant.middleware import TenantMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="SIGDU API",
        description="Sistema de Gestión Deportiva Universitaria — UNSAM",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TenantMiddleware)

    @app.get("/health", tags=["sistema"])
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    from app.auth.router import router as auth_router
    from app.catalog.router import router as catalog_router

    app.include_router(auth_router)
    app.include_router(catalog_router)

    return app


app = create_app()
