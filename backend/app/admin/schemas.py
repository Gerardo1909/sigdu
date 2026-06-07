from pydantic import BaseModel


class CreateDisciplineRequest(BaseModel):
    name: str
    description: str | None = None


class CreateVenueRequest(BaseModel):
    name: str
    address: str | None = None
    capacity: int = 0


class UpdateRoleRequest(BaseModel):
    role: str


class InstitutionConfig(BaseModel):
    name: str
    logo_url: str | None
    contact_email: str | None
    contact_phone: str | None

    model_config = {"from_attributes": True}


class UpdateInstitutionRequest(BaseModel):
    name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None


class UserAdminResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class PaginatedUsersResponse(BaseModel):
    items: list[UserAdminResponse]
    total: int
    page: int
