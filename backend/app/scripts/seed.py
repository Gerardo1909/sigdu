"""
Seed script — idempotente.
Ejecutar: python -m app.scripts.seed
"""
import asyncio
from uuid import uuid4

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base  # noqa: F401
import app.auth.models  # noqa: F401
import app.tenant.models  # noqa: F401
import app.catalog.models  # noqa: F401

from app.auth.models import User, UserRole
from app.auth.service import _hash_password
from app.tenant.models import Institution
from app.catalog.models import Activity, Discipline, Venue

engine = create_async_engine(settings.DATABASE_URL, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def create_schemas_and_tables() -> None:
    """Crea schemas y tablas directamente. Idempotente via IF NOT EXISTS."""
    print("[SEED] Creando schemas y tablas...")
    async with engine.begin() as conn:
        # Schemas
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS shared"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_unsam"))

        # shared.institutions
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS shared.institutions (
                id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                slug VARCHAR NOT NULL UNIQUE,
                logo_url VARCHAR,
                email_domains VARCHAR NOT NULL,
                contact_email VARCHAR,
                contact_phone VARCHAR,
                PRIMARY KEY (id)
            )
        """))

        # enum en tenant_unsam
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE tenant_unsam.userrole AS ENUM (
                    'super_admin', 'admin', 'directivo', 'profesor', 'alumno'
                );
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$
        """))

        # tenant_unsam.users
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tenant_unsam.users (
                id VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                hashed_password VARCHAR NOT NULL,
                full_name VARCHAR NOT NULL,
                role tenant_unsam.userrole NOT NULL DEFAULT 'alumno',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                last_login TIMESTAMPTZ,
                PRIMARY KEY (id)
            )
        """))

        # tenant_unsam.disciplines
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tenant_unsam.disciplines (
                id VARCHAR NOT NULL,
                name VARCHAR NOT NULL UNIQUE,
                description TEXT,
                PRIMARY KEY (id)
            )
        """))

        # tenant_unsam.venues
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tenant_unsam.venues (
                id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                address VARCHAR,
                capacity INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            )
        """))

        # tenant_unsam.activities
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tenant_unsam.activities (
                id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                description TEXT,
                capacity INTEGER NOT NULL DEFAULT 0,
                schedule_description VARCHAR,
                discipline_id VARCHAR NOT NULL REFERENCES tenant_unsam.disciplines(id),
                venue_id VARCHAR NOT NULL REFERENCES tenant_unsam.venues(id),
                professor_id VARCHAR REFERENCES tenant_unsam.users(id),
                PRIMARY KEY (id)
            )
        """))

        # tenant_unsam.enrollments
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tenant_unsam.enrollments (
                id VARCHAR NOT NULL,
                activity_id VARCHAR NOT NULL REFERENCES tenant_unsam.activities(id),
                user_id VARCHAR NOT NULL REFERENCES tenant_unsam.users(id),
                status VARCHAR NOT NULL DEFAULT 'active',
                enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (id)
            )
        """))

    print("[SEED] Schemas y tablas OK")


async def seed_institution(session: AsyncSession) -> None:
    existing = await session.scalar(
        select(Institution).where(Institution.slug == "unsam")
    )
    if existing:
        print("[SEED] Institución UNSAM ya existe — skip")
        return

    institution = Institution(
        id=str(uuid4()),
        name="Universidad Nacional de San Martin",
        slug="unsam",
        email_domains="unsam.edu.ar,estudiantes.unsam.edu.ar,demo.sigdu.com",
        contact_email="deportes@unsam.edu.ar",
        contact_phone=None,
        logo_url=None,
    )
    session.add(institution)
    await session.commit()
    print("[SEED] Institución UNSAM creada")


USERS_DATA = [
    ("admin@unsam.edu.ar", "admin123", UserRole.admin, "Maria Rodriguez"),
    ("profesor@unsam.edu.ar", "prof123", UserRole.profesor, "Carlos Gomez"),
    ("profesor2@unsam.edu.ar", "prof123", UserRole.profesor, "Laura Martinez"),
    ("alumno1@estudiantes.unsam.edu.ar", "alumno123", UserRole.alumno, "Juan Perez"),
    ("alumno2@estudiantes.unsam.edu.ar", "alumno123", UserRole.alumno, "Sofia Garcia"),
    ("alumno3@estudiantes.unsam.edu.ar", "alumno123", UserRole.alumno, "Martin Lopez"),
    ("directivo@unsam.edu.ar", "dir123", UserRole.directivo, "Ana Fernandez"),
]


async def seed_users(session: AsyncSession) -> dict[str, str]:
    email_to_id: dict[str, str] = {}
    for email, password, role, full_name in USERS_DATA:
        existing = await session.scalar(select(User).where(User.email == email))
        if existing:
            print(f"[SEED] Usuario {email} ya existe — skip")
            email_to_id[email] = existing.id
            continue
        user = User(
            id=str(uuid4()),
            email=email,
            hashed_password=_hash_password(password),
            full_name=full_name,
            role=role,
            is_active=True,
        )
        session.add(user)
        await session.flush()
        email_to_id[email] = user.id
        print(f"[SEED] Usuario creado: {email} ({role.value})")
    await session.commit()
    return email_to_id


DISCIPLINES_DATA = [
    ("Futbol", "Fútbol recreativo y competitivo"),
    ("Voley", "Vóley mixto y por género"),
    ("Hockey", "Hockey sobre césped"),
    ("Handball", "Handball mixto"),
    ("Running", "Grupos de running y atletismo"),
    ("Basquet", "Básquet 3x3 y 5x5"),
]


async def seed_disciplines(session: AsyncSession) -> dict[str, str]:
    name_to_id: dict[str, str] = {}
    for name, description in DISCIPLINES_DATA:
        existing = await session.scalar(select(Discipline).where(Discipline.name == name))
        if existing:
            print(f"[SEED] Disciplina {name} ya existe — skip")
            name_to_id[name] = existing.id
            continue
        d = Discipline(id=str(uuid4()), name=name, description=description)
        session.add(d)
        await session.flush()
        name_to_id[name] = d.id
        print(f"[SEED] Disciplina creada: {name}")
    await session.commit()
    return name_to_id


VENUES_DATA = [
    ("Polideportivo Campus Miguelete", "Campus Miguelete, San Martín", 500),
    ("Cancha de Futbol 11", "Campus Miguelete, San Martín", 200),
    ("Gimnasio Cubierto", "Campus Miguelete, San Martín", 100),
    ("Pista de Atletismo", "Campus Miguelete, San Martín", 150),
]


async def seed_venues(session: AsyncSession) -> dict[str, str]:
    name_to_id: dict[str, str] = {}
    for name, address, capacity in VENUES_DATA:
        existing = await session.scalar(select(Venue).where(Venue.name == name))
        if existing:
            print(f"[SEED] Sede {name} ya existe — skip")
            name_to_id[name] = existing.id
            continue
        v = Venue(id=str(uuid4()), name=name, address=address, capacity=capacity)
        session.add(v)
        await session.flush()
        name_to_id[name] = v.id
        print(f"[SEED] Sede creada: {name}")
    await session.commit()
    return name_to_id


async def seed_activities(
    session: AsyncSession,
    disciplines: dict[str, str],
    venues: dict[str, str],
    users: dict[str, str],
) -> None:
    prof_carlos = users.get("profesor@unsam.edu.ar")
    prof_laura = users.get("profesor2@unsam.edu.ar")

    activities_data = [
        ("Futbol - Turno Tarde", disciplines["Futbol"], venues["Cancha de Futbol 11"], "Lun-Mie 18:00-20:00", 25, prof_carlos),
        ("Voley Mixto", disciplines["Voley"], venues["Gimnasio Cubierto"], "Mar-Jue 17:00-19:00", 16, prof_laura),
        ("Hockey Femenino", disciplines["Hockey"], venues["Polideportivo Campus Miguelete"], "Lun-Vie 16:00-18:00", 20, prof_carlos),
        ("Handball Mixto", disciplines["Handball"], venues["Gimnasio Cubierto"], "Mar-Jue 19:00-21:00", 18, prof_laura),
        ("Running Grupal", disciplines["Running"], venues["Pista de Atletismo"], "Sab 09:00-11:00", 30, prof_carlos),
        ("Basquet 3x3", disciplines["Basquet"], venues["Gimnasio Cubierto"], "Mie-Vie 18:00-20:00", 12, prof_laura),
    ]

    for name, discipline_id, venue_id, schedule, capacity, professor_id in activities_data:
        existing = await session.scalar(select(Activity).where(Activity.name == name))
        if existing:
            print(f"[SEED] Actividad {name} ya existe — skip")
            continue
        a = Activity(
            id=str(uuid4()),
            name=name,
            discipline_id=discipline_id,
            venue_id=venue_id,
            schedule_description=schedule,
            capacity=capacity,
            professor_id=professor_id,
        )
        session.add(a)
        print(f"[SEED] Actividad creada: {name}")
    await session.commit()


async def main() -> None:
    print("[SEED] Iniciando seed...")

    await create_schemas_and_tables()

    async with session_factory() as session:
        await session.execute(text("SET search_path TO shared, tenant_unsam"))
        await seed_institution(session)

    async with session_factory() as session:
        await session.execute(text("SET search_path TO tenant_unsam, shared"))
        users = await seed_users(session)

    async with session_factory() as session:
        await session.execute(text("SET search_path TO tenant_unsam, shared"))
        disciplines = await seed_disciplines(session)

    async with session_factory() as session:
        await session.execute(text("SET search_path TO tenant_unsam, shared"))
        venues = await seed_venues(session)

    async with session_factory() as session:
        await session.execute(text("SET search_path TO tenant_unsam, shared"))
        await seed_activities(session, disciplines, venues, users)

    await engine.dispose()
    print("[SEED] Seed completado exitosamente.")


if __name__ == "__main__":
    asyncio.run(main())
