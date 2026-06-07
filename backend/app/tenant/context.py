from contextvars import ContextVar

_tenant_schema: ContextVar[str] = ContextVar("tenant_schema", default="tenant_unsam")


def set_tenant_schema(schema: str) -> None:
    _tenant_schema.set(schema)


def get_tenant_schema() -> str:
    return _tenant_schema.get()
