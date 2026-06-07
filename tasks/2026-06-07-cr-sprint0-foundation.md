# Code Review — Sprint 0 Foundation

**Fecha**: 2026-06-07  
**Sprint**: Sprint 0 — Foundation  
**Veredicto**: APROBADO (post-fix M1 y M2 aplicados por arquitecto el 2026-06-07)

## Resumen ejecutivo

ITERAR — 0 hallazgos de alta severidad, 2 de media, 3 de baja. Python syntax: PASS. TypeScript tsc: PASS. La foundation es sólida pero hay un bug de arranque en Docker que bloquea `docker compose up` en frontend, y un secreto hardcodeado en docker-compose.yml que debe resolverse antes de Sprint 1.

---

## Checks técnicos

| Check | Resultado |
|-------|-----------|
| Python syntax (`py_compile`) | PASS |
| TypeScript tsc (`--noEmit`) | PASS |
| Secretos en código fuente | PASS |
| Secretos en docker-compose.yml | FAIL |
| Stack correcto (FastAPI, asyncpg, Next.js 14, shadcn/ui) | PASS |
| Estructura de archivos Sprint 0 | PASS |

---

## Hallazgos

### Alta severidad

_Ninguno._

---

### Media severidad

#### M1 — Volume mount inexistente en frontend rompe el hot-reload de Docker

**Archivo**: `docker-compose.yml` línea 48  
**Problema**: El servicio `frontend` monta `./frontend/src:/app/src`, pero el proyecto Next.js fue creado sin directorio `src/` (flag `--no-src-dir`). Todo el código vive en `app/`, `components/`, `lib/`, `hooks/`. El volume mount apunta a una ruta que no existe en el host, lo que en la mayoría de runtimes Docker crea un directorio vacío y oculta el código real dentro del contenedor. El frontend arrancará con una app vacía o fallará al no encontrar `app/layout.tsx`.

**Fix**: Eliminar el volume mount de frontend (para Sprint 0 no se necesita hot-reload en frontend, el Dockerfile hace `COPY . .`), o reemplazarlo por los directorios reales:
```yaml
volumes:
  - ./frontend/app:/app/app
  - ./frontend/components:/app/components
  - ./frontend/lib:/app/lib
  - ./frontend/hooks:/app/hooks
```
La opción más limpia para un Dockerfile de dev es no montar nada y reconstruir la imagen cuando cambia código.

**Rol**: backend_dev / infra (quien gestiona docker-compose).

---

#### M2 — `SECRET_KEY` hardcodeada en docker-compose.yml

**Archivo**: `docker-compose.yml` línea 24  
**Problema**: `SECRET_KEY: dev-secret-key-cambiar-en-produccion` está hardcodeada directamente en el archivo de composición que se commitea al repo. Aunque el valor sea un default de dev, el patrón correcto es leer de `.env`:
```yaml
SECRET_KEY: ${SECRET_KEY}
```
El `.env.example` ya documenta la variable. El `docker-compose.yml` debe referenciarla, no definirla.

**Nota**: `config.py` está correcto (usa pydantic-settings con default de dev). El problema es solo el docker-compose.

**Rol**: backend_dev / infra.

---

### Baja severidad / observaciones

#### B1 — SQL injection teórico en `database.py` y `alembic/env.py` (f-string en SET search_path)

**Archivos**: `backend/app/database.py` línea 24, `backend/alembic/env.py` líneas 34-35  
**Problema**: `SET search_path TO {schema}` usa f-string con el nombre del schema sin sanitización. En el flujo actual esto es seguro: los valores de schema provienen exclusivamente de `TENANT_MAP` en el middleware (whitelist estática). Sin embargo, si en Sprint 1 o 2 se agrega un path donde el schema se construye a partir de input del usuario sin pasar por `TENANT_MAP`, se abre una inyección SQL.  
**Recomendación**: Documentar con un comentario inline que `schema` siempre viene de `TENANT_MAP`, o usar `sqlalchemy.schema.quoted_name()` para blindar el identificador.  
**No es bloqueante**.

#### B2 — Dockerfile de frontend usa `npm run dev` en producción

**Archivo**: `frontend/Dockerfile` línea 12  
**Problema**: El CMD es `["npm", "run", "dev"]` que inicia el servidor de desarrollo de Next.js. Para un build de producción debería ser `next build && next start`. Para Sprint 0 (entorno de desarrollo) esto es aceptable, pero debe corregirse antes de cualquier deployment.  
**No es bloqueante para Sprint 0**.

#### B3 — `@base-ui/react` no es el shadcn/ui canónico

**Archivo**: `frontend/components/ui/badge.tsx`, `frontend/components/ui/button.tsx`, `frontend/package.json`  
**Contexto**: La guía técnica especifica "shadcn/ui para componentes base". El frontend_dev instaló shadcn v4 que internamente usa `@base-ui/react` en lugar de `@radix-ui`. Los componentes generados funcionan y el TypeScript compila sin errores.  
**Riesgo**: Si en Sprint 1 se necesitan más componentes shadcn (Dialog, Select, Combobox, etc.), la API de `@base-ui/react` difiere de `@radix-ui` en el patrón de composición (`render` prop vs `asChild`). Esto puede generar fricción al escalar.  
**Recomendación**: Confirmar con el tech lead si shadcn v4/base-ui es aceptado o si se debe fijar a shadcn v2/v3 con Radix. No es un bloqueante para Sprint 0 ya que los componentes actuales compilan y funcionan.

---

## Veredicto detallado

El Sprint 0 cumple el objetivo declarado: la estructura de archivos es correcta, el stack es el especificado (FastAPI + asyncpg + SQLAlchemy async + pydantic-settings, Next.js 14 + Tailwind + shadcn), el TypeScript no tiene `any`, Python compila sin errores, y el diseño multi-tenant con ContextVar + TenantMiddleware + SET search_path dinámico es correcto.

Sin embargo, **el objetivo concreto del Sprint 0 es que `docker compose up` muestre Next.js con branding SIGDU + FastAPI en /docs**. El hallazgo M1 (volume mount apuntando a `./frontend/src` que no existe) puede impedir que el contenedor frontend sirva correctamente la landing page, lo que constituye una falla directa en el entregable del sprint.

El hallazgo M2 (SECRET_KEY en docker-compose.yml) es un problema de seguridad menor pero de principio: el objetivo explícito de Sprint 0 es "sin secretos hardcodeados", y aunque config.py lo hace bien, docker-compose.yml lo anula.

Por estas dos razones el veredicto es **ITERAR**, no RECHAZAR: ambos problemas son correcciones de 5 minutos, no diseños erróneos.

---

## Próximas acciones

1. **Corregir M1** (bloqueante para `docker compose up`): Eliminar el volume mount `./frontend/src:/app/src` en docker-compose.yml o reemplazarlo por los directorios reales del proyecto. **Rol: backend_dev o infra.**

2. **Corregir M2** (principio de no-secretos en repo): Cambiar `SECRET_KEY: dev-secret-key-cambiar-en-produccion` en docker-compose.yml por `SECRET_KEY: ${SECRET_KEY}`. **Rol: backend_dev o infra.**

3. **Confirmar decisión sobre shadcn v4 vs v3** (B3) antes de Sprint 1 para no tener que migrar componentes a mitad de sprint. **Rol: tech lead / decisión de equipo.**

4. Una vez corregidos M1 y M2, el Sprint 0 puede marcarse como APROBADO y Sprint 1 puede comenzar.
