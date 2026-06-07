import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.database import Base  # noqa: F401

# Import all models so Base.metadata is populated for autogenerate
import app.auth.models  # noqa: F401
import app.tenant.models  # noqa: F401
import app.catalog.models  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

TENANT_SCHEMAS = ["tenant_unsam"]
SHARED_SCHEMA = "shared"


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection, schema: str) -> None:
    connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema}"))
    connection.execute(text(f"SET search_path TO {schema}"))
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema=schema,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    from app.config import settings as app_settings
    import os
    db_url = os.environ.get("DATABASE_URL") or app_settings.DATABASE_URL

    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = db_url

    connectable = async_engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SHARED_SCHEMA}"))
        for schema in TENANT_SCHEMAS:
            await connection.run_sync(do_run_migrations, schema)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
