# Sprint 0 Frontend — Foundation

**Date:** 2026-06-07  
**Agent:** frontend_dev  
**Status:** success

---

## DoD Checks

| Check | Status |
|-------|--------|
| `frontend/` existe con Next.js 14 inicializado | PASS |
| `frontend/app/layout.tsx` con tema oscuro (`className="dark"`) | PASS |
| `frontend/app/page.tsx` con landing SIGDU branding | PASS |
| `frontend/Dockerfile` existe | PASS |
| shadcn/ui inicializado (`components/ui/` con button + badge) | PASS |
| TypeScript compila sin errores (`tsc --noEmit`) | PASS |

---

## Resultado de `tsc --noEmit`

Sin errores. Output vacío = compilación limpia.

---

## Archivos creados

### App Router
- `app/layout.tsx` — RootLayout con Inter, metadata SIGDU, `<html lang="es" className="dark">`
- `app/page.tsx` — Landing con navbar, hero, features grid, footer (branding SIGDU/UNSAM)
- `app/globals.css` — Variables CSS shadcn (dark theme), generado por `shadcn init`
- `app/login/page.tsx` — Placeholder Sprint 1
- `app/register/page.tsx` — Placeholder Sprint 1
- `app/catalog/page.tsx` — Placeholder Sprint 1
- `app/dashboard/layout.tsx` — Placeholder Sprint 2
- `app/dashboard/page.tsx` — Placeholder Sprint 2

### Componentes shadcn/ui (copiados al repo vía `npx shadcn@latest`)
- `components/ui/button.tsx` — Button con variantes (default, outline, ghost, secondary...)
- `components/ui/badge.tsx` — Badge con variantes

### Lib (esqueletos)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge), generado por shadcn
- `lib/types.ts` — Interface `User` con roles tipados
- `lib/api.ts` — `apiFetch()` wrapper skeleton
- `lib/auth.ts` — `getToken / setToken / removeToken`

### Hooks (esqueletos)
- `hooks/use-auth.ts` — `useAuth()` skeleton ("use client")
- `hooks/use-api.ts` — `useApi()` skeleton ("use client")

### Infraestructura
- `Dockerfile` — Node 20 Alpine, dev server en puerto 3000
- `tailwind.config.ts` — darkMode class, colores custom (`unsam-blue`, `sigdu-dark`)
- `components.json` — Config shadcn v4

---

## Decisiones técnicas tomadas

1. **shadcn v4 instalado** (no v2/v3): El comando `npx shadcn@latest` instala v4.10.0 que usa `@base-ui/react` en lugar de `@radix-ui`. Los componentes funcionan igual pero la API interna es diferente. El `Button` en v4 usa `ButtonPrimitive` de base-ui con prop `render` para polimorfismo.

2. **`page.tsx` usa `<Link>` nativo de Next.js** en lugar de `<Button>` de shadcn para los CTAs: la razón es que shadcn v4 Button no expone `asChild` (patrón Radix), sino `render` (patrón base-ui). Para mantener semántica correcta de links sin perder styling, se usaron clases Tailwind directas en los `<Link>`. El resultado visual es idéntico al spec.

3. **globals.css usa formato OKLCH**: shadcn v4 genera variables con `oklch()` en lugar de HSL. Esto es CSS moderno compatible con Tailwind v3+. No requiere cambios.

4. **tailwindcss-animate instalado** como dependencia directa (además de `tw-animate-css` que instala shadcn). El `tailwind.config.ts` referencia `tailwindcss-animate` como plugin según el spec.

---

## Notas para el code_reviewer

- El `globals.css` tiene `@import "tw-animate-css"` y `@import "shadcn/tailwind.css"` generados por shadcn v4 — son las nuevas formas de importar en v4, reemplazando el viejo `@tailwind base/components/utilities`. El archivo funciona correctamente.
- `next.config.mjs` no fue modificado (configuración default de Next.js 14, sin cambios necesarios para Sprint 0).
- El `public/` directory fue creado pero está vacío — Next.js lo crea automáticamente via create-next-app implícitamente (no aparece listado pero existe como parte del proyecto).
- No hay tests (decisión explícita del proyecto).
- No hay `src/` directory (flag `--no-src-dir` en create-next-app).
