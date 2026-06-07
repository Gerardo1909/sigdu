# SIGDU — Sistema de Gestión Deportiva Universitaria

Sistema de gestión de inscripciones, asistencia y analytics deportivo para la Universidad Nacional de San Martín (UNSAM).

---

## Requisitos

- Docker Desktop (o Docker Engine + Docker Compose en Linux)
- Puertos **3000**, **5432** y **8000** libres

---

## Setup (3 comandos)

```bash
git clone <URL-del-repositorio>
cd sigdu
docker compose up --build
```

Esperar ~90 segundos a que los 3 servicios arranquen. Abrir `http://localhost:3000`.

---

## Servicios

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| API REST  | http://localhost:8000        |
| Swagger   | http://localhost:8000/docs   |

---

## Credenciales de demo

| Rol                  | Email                                  | Password  |
|----------------------|----------------------------------------|-----------|
| Admin Institucional  | admin@unsam.edu.ar                     | admin123  |
| Profesor             | profesor@unsam.edu.ar                  | prof123   |
| Profesor             | profesor2@unsam.edu.ar                 | prof123   |
| Alumno               | alumno1@estudiantes.unsam.edu.ar       | alumno123 |
| Alumno               | alumno2@estudiantes.unsam.edu.ar       | alumno123 |
| Alumno               | alumno3@estudiantes.unsam.edu.ar       | alumno123 |
| Directivo            | directivo@unsam.edu.ar                 | dir123    |

Para registrar nuevos usuarios durante la demo, usar el dominio `@demo.sigdu.com`.

---

## Flujo de demo (10 minutos)

### 1. Landing y Catálogo Público (sin login)

- Abrir `http://localhost:3000` — ver la landing con branding UNSAM
- Navegar al catálogo de actividades deportivas
- Filtrar por disciplina "Fútbol" — ver solo las actividades de fútbol
- Hacer clic en "Fútbol - Turno Tarde" — ver el detalle con horarios, sede, cupo y profesor

### 2. Registro de nuevo alumno

- Clic en "Registrarse"
- Usar email: `nuevo@demo.sigdu.com`, password: `test1234`
- Ver cómo el sistema acepta el dominio `demo.sigdu.com`
- Intentar con `test@gmail.com` — ver el rechazo con mensaje de dominio no válido

### 3. Flujo del alumno

- Login como `alumno1@estudiantes.unsam.edu.ar` / `alumno123`
- Ver el dashboard del alumno con sus inscripciones activas
- Inscribirse en "Básquet 3x3" — ver la confirmación
- Intentar inscribirse en una actividad con cupo lleno — ver el mensaje de error

### 4. Flujo del profesor

- Cerrar sesión. Login como `profesor@unsam.edu.ar` / `prof123`
- Ver las clases del día con la lista de alumnos inscriptos
- Entrar a "Fútbol - Turno Tarde" — marcar asistencia con checkboxes
- Confirmar — ver el resumen (presentes / ausentes / porcentaje)

### 5. Flujo del administrador

- Cerrar sesión. Login como `admin@unsam.edu.ar` / `admin123`
- Crear nueva disciplina "Natación"
- Crear nueva sede "Pileta Olímpica"
- Ver lista de usuarios — asignar rol "Profesor" a un alumno
- Editar configuración de la institución (nombre, contacto)

### 6. Analytics

- Navegar a "Analytics" en el sidebar
- Ver el dashboard con 4 gráficos: inscripciones en el tiempo, asistencia por actividad, distribución por disciplina, top actividades
- Filtrar por disciplina "Vóley"
- Clic en "Exportar Excel" — descargar el reporte

### 7. API (bonus)

- Abrir `http://localhost:8000/docs` — ver la documentación Swagger auto-generada

---

## Variables de entorno

Copiar `.env.example` a `.env` para configurar el entorno:

```bash
cp .env.example .env
```

| Variable          | Valor por defecto                                        | Descripción                  |
|-------------------|----------------------------------------------------------|------------------------------|
| `DATABASE_URL`    | postgresql+asyncpg://sigdu:sigdu_dev@db:5432/sigdu       | URL de conexión a PostgreSQL |
| `SECRET_KEY`      | dev-secret-key-cambiar-en-produccion                     | Clave para firmar JWT        |
| `CORS_ORIGINS`    | http://localhost:3000                                    | Orígenes permitidos para CORS|

---

## Arquitectura

```
sigdu/
├── docker-compose.yml        # Orquesta los 3 servicios
├── backend/                  # FastAPI + SQLAlchemy async
│   ├── app/
│   │   ├── auth/             # Registro, login, JWT
│   │   ├── catalog/          # Disciplinas, sedes, actividades
│   │   ├── enrollment/       # Inscripciones
│   │   ├── attendance/       # Clases y asistencia
│   │   ├── admin/            # Gestión institucional
│   │   ├── analytics/        # Dashboard y exportación
│   │   ├── setup/            # Onboarding institucional
│   │   └── tenant/           # Multi-tenancy (schema-per-tenant)
│   └── scripts/
│       └── seed.py           # Datos de demo UNSAM
└── frontend/                 # Next.js 14 + Tailwind + shadcn/ui
    └── app/
        ├── catalog/          # Catálogo público
        ├── dashboard/        # Dashboards por rol
        └── setup/            # Wizard de onboarding
```

Multi-tenancy via **schema-per-tenant** en PostgreSQL. El schema `tenant_unsam` contiene todos los datos de UNSAM. El middleware `TenantMiddleware` setea el `search_path` por request.
