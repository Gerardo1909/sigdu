"""Sprint 2 — tablas attendance (class_sessions, attendance_records)

Revision ID: 0002_sprint2
Revises: 0001_sprint1
Create Date: 2026-06-07

NOTE: Crea las tablas nuevas de asistencia en tenant_unsam.
Es idempotente — usa CREATE TABLE IF NOT EXISTS.
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_sprint2"
down_revision = "0001_sprint1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Also ensure enrollments has status and enrolled_at columns (Sprint 1 migration
    # created the table without them — add if missing)
    conn.execute(sa.text("""
        ALTER TABLE tenant_unsam.enrollments
            ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ DEFAULT now()
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.class_sessions (
            id VARCHAR NOT NULL,
            activity_id VARCHAR NOT NULL REFERENCES tenant_unsam.activities(id),
            date DATE NOT NULL,
            created_by VARCHAR REFERENCES tenant_unsam.users(id),
            PRIMARY KEY (id)
        )
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tenant_unsam.attendance_records (
            id VARCHAR NOT NULL,
            class_session_id VARCHAR NOT NULL REFERENCES tenant_unsam.class_sessions(id),
            user_id VARCHAR NOT NULL REFERENCES tenant_unsam.users(id),
            present BOOLEAN NOT NULL DEFAULT FALSE,
            recorded_at TIMESTAMPTZ DEFAULT now(),
            PRIMARY KEY (id)
        )
    """))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.attendance_records"))
    conn.execute(sa.text("DROP TABLE IF EXISTS tenant_unsam.class_sessions"))
