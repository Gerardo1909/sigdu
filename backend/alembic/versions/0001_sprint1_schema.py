"""Sprint 1 — schema shared + tenant_unsam (auth, catalog)

Revision ID: 0001_sprint1
Revises:
Create Date: 2026-06-07

NOTE: Esta migración crea todas las tablas de los schemas shared y tenant_unsam.
Es idempotente — usa CREATE TABLE IF NOT EXISTS vía op.execute con SQL raw.
El env.py ejecuta run_migrations() una vez por schema (loop TENANT_SCHEMAS),
pero como todas las DDL usan IF NOT EXISTS / IF NOT EXISTS check, es seguro.
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_sprint1"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # ── shared schema ────────────────────────────────────────────────────────
    conn.execute(sa.text("CREATE SCHEMA IF NOT EXISTS shared"))
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS shared.institutions (
            id VARCHAR NOT NULL,
            name VARCHAR NOT NULL,
            slug VARCHAR NOT NULL,
            logo_url VARCHAR,
            email_domains VARCHAR NOT NULL,
            contact_email VARCHAR,
            contact_phone VARCHAR,
            PRIMARY KEY (id),
            UNIQUE (slug)
        )
    """))
    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_institutions_slug
        ON shared.institutions (slug)
    """))

    # ── tenant_unsam schema ──────────────────────────────────────────────────
    conn.execute(sa.text("CREATE SCHEMA IF NOT EXISTS tenant_unsam"))

    # Enum type — only create if it doesn't exist
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE tenant_unsam.userrole AS ENUM (
                'super_admin', 'admin', 'directivo', 'profesor', 'alumno'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.users (
            id VARCHAR NOT NULL,
            email VARCHAR NOT NULL,
            hashed_password VARCHAR NOT NULL,
            full_name VARCHAR NOT NULL,
            role tenant_unsam.userrole NOT NULL DEFAULT 'alumno',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            last_login TIMESTAMPTZ,
            PRIMARY KEY (id),
            UNIQUE (email)
        )
    """))
    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_users_email
        ON tenant_unsam.users (email)
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.disciplines (
            id VARCHAR NOT NULL,
            name VARCHAR NOT NULL,
            description TEXT,
            PRIMARY KEY (id),
            UNIQUE (name)
        )
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.venues (
            id VARCHAR NOT NULL,
            name VARCHAR NOT NULL,
            address VARCHAR,
            capacity INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (id)
        )
    """))

    conn.execute(sa.text("""
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

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.enrollments (
            id VARCHAR NOT NULL,
            activity_id VARCHAR NOT NULL REFERENCES tenant_unsam.activities(id),
            user_id VARCHAR NOT NULL REFERENCES tenant_unsam.users(id),
            PRIMARY KEY (id)
        )
    """))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.enrollments"))
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.activities"))
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.venues"))
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.disciplines"))
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.users"))
    conn.execute(sa.text("DROP TYPE IF EXISTS tenant_unsam.userrole"))
    conn.execute(sa.text("DROP SCHEMA IF EXISTS tenant_unsam"))
    conn.execute(sa.text("DROP INDEX IF EXISTS shared.ix_institutions_slug"))
    conn.execute(sa.text("DROP TABLE IF EXISTS shared.institutions"))
    conn.execute(sa.text("DROP SCHEMA IF EXISTS shared"))
