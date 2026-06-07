from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from .context import set_tenant_schema

TENANT_MAP = {
    "unsam": "tenant_unsam",
}
DEFAULT_TENANT = "tenant_unsam"


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        tenant_header = request.headers.get("X-Tenant-ID")
        if tenant_header and tenant_header in TENANT_MAP:
            schema = TENANT_MAP[tenant_header]
        else:
            schema = DEFAULT_TENANT

        set_tenant_schema(schema)
        response = await call_next(request)
        return response
