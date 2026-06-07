# Handoff — Sprint 0 Backend Foundation

**Fecha**: 2026-06-07  
**Agente**: backend_dev  
**Status**: success

---

## Archivos creados

### backend/
- `backend/pyproject.toml` — dependencias con uv/hatchling
- `backend/Dockerfile` — imagen python:3.12-slim, instala via uv
- `backend/alembic.ini` — configuración alembic apuntando a PostgreSQL local
- `backend/alembic/env.py` — migraciones async multi-schema (shared + tenant_unsam)
- `backend/alembic/versions/.gitkeep` — directorio de versiones listo para git

### backend/app/
- `backend/app/__init__.py`
- `backend/app/main.py` — App factory, CORS, TenantMiddleware, lifespan, health endpoint
- `backend/app/config.py` — pydantic-settings, lee de .env o variables de entorno
- `backend/app/database.py` — engine async, session factory, SET search_path dinámico
- `backend/app/dependencies.py` — get_db, require_role esqueleto con jerarquía de roles

### backend/app/tenant/
- `backend/app/tenant/__init__.py`
- `backend/app/tenant/context.py` — ContextVar para schema activo por request
- `backend/app/tenant/middleware.py` — TenantMiddleware, resuelve X-Tenant-ID → schema

### Raíz sigdu/
- `docker-compose.yml` — servicios: db (postgres:16), backend (FastAPI), frontend (placeholder)
- `.env.example` — variables de entorno documentadas

### tasks/
- `tasks/PROGRESO.md` — tracking actualizado del sprint

---

## Endpoints disponibles (Sprint 0)

| Método | Path      | Descripción              |
|--------|-----------|--------------------------|
| GET    | `/health` | Liveness check del server |

Respuesta esperada: `{"status": "ok", "version": "0.1.0"}`

Swagger disponible en `/docs` una vez levantado el servidor.

---

## DoD Checks

- [x] Todos los archivos existen en las rutas correctas
- [x] No hay secretos hardcodeados — SECRET_KEY y DATABASE_URL vienen de entorno (Settings pydantic-settings con defaults de dev marcados como "cambiar en produccion")
- [x] `app/main.py` define FastAPI con CORSMiddleware y TenantMiddleware
- [x] Health endpoint en `/health` retorna JSON `{"status": "ok", "version": "0.1.0"}`
- [x] `docker-compose.yml` y `.env.example` están en la raíz

---

## Notas para frontend_dev

- El backend escucha en `http://localhost:8000` (docker) o directo con uvicorn
- CORS configurado para `http://localhost:3000` (configurable via `CORS_ORIGINS`)
- Para indicar tenant usar header `X-Tenant-ID: unsam` en cada request
- Swagger UI disponible en `http://localhost:8000/docs`
- Para levantar solo la DB: `docker compose up db`
- Para levantar todo: `docker compose up` (frontend service requiere que exista `frontend/Dockerfile`)

## Notas para code_reviewer

- `dependencies.py::require_role` importa `app.auth.service.decode_token` que todavia no existe — es un esqueleto intencional para Sprint 1 (auth module). No hay error en startup porque el import es lazy (dentro de la función async).
- `alembic/env.py` usa `asyncio.run()` directamente; compatible con alembic >= 1.13 sin el runner experimental.
- El `SET search_path` en `database.py` usa f-string sin escape — los nombres de schema vienen exclusivamente de `TENANT_MAP` (whitelist en middleware), no de input de usuario. Riesgo de SQL injection es nulo en el flujo actual pero conviene documentarlo.
- `echo=settings.APP_ENV == "development"` — el engine loguea todas las queries en dev. Desactivar en produccion seteando `APP_ENV=production`.
- No hay `__init__.py` en `alembic/` ni `alembic/versions/` — esto es intencional, alembic no los requiere.
