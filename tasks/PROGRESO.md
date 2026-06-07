# PROGRESO SIGDU MVP

## Sprint 0 — Foundation

**Estado**: APROBADO ✓  
**Fecha inicio**: 2026-06-07  
**Fecha cierre**: 2026-06-07  
**Veredicto CR**: APROBADO (post-fix M1 y M2)

### Backend
- [x] pyproject.toml con dependencias
- [x] app/main.py (CORS, lifespan, health)
- [x] app/config.py (pydantic-settings)
- [x] app/database.py (engine async + session factory)
- [x] app/tenant/context.py
- [x] app/tenant/middleware.py
- [x] app/dependencies.py (esqueleto)
- [x] Alembic setup con multi-schema
- [x] Dockerfile backend

### Infra
- [x] docker-compose.yml
- [x] .env.example
- [x] **FIX M1**: Volumes frontend corregidos (app/, components/, lib/, hooks/)
- [x] **FIX M2**: SECRET_KEY usa interpolación `${SECRET_KEY:-default}`

### Frontend
- [x] Next.js 14 inicializado
- [x] shadcn/ui configurado (v4 con @base-ui/react)
- [x] Root layout con tema oscuro
- [x] Landing placeholder con branding SIGDU
- [x] Dockerfile frontend

### Checks técnicos Sprint 0
- [x] Python syntax: PASS
- [x] TypeScript tsc --noEmit: PASS
- [x] Sin `any` en TypeScript: PASS
- [x] Stack correcto: PASS
- [x] Estructura de archivos: PASS
- [x] docker-compose.yml sin secretos hardcodeados: PASS
- [x] docker-compose.yml con volumes correctos: PASS

### Deuda técnica conocida (no bloqueante)
- B1: Documentar whitelist de schemas en database.py (protección SQL injection preventiva)
- B2: Dockerfile frontend usa `npm run dev` — aceptable para dev, cambiar antes de deploy
- B3 (RESUELTO): shadcn v4 con @base-ui/react confirmado y documentado en frontend/BASEUI_GUIDE.md

## Post-Sprint 0 — Setup Base UI completo (2026-06-07)

- [x] Todos los componentes shadcn del MVP pre-instalados con Base UI:
      card, input, label, select, table, dialog, dropdown-menu,
      sonner, skeleton, separator, avatar, tabs, sheet
- [x] form.tsx creado manualmente (wrapper react-hook-form)
- [x] react-hook-form + zod + @hookform/resolvers instalados
- [x] next-themes + Toaster montados en app/layout.tsx
- [x] BASEUI_GUIDE.md — guía de diferencias API para frontend_dev
- [x] tsc --noEmit: PASS
