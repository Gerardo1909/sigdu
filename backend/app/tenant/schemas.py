from pydantic import BaseModel


class InstitutionResponse(BaseModel):
    id: str
    name: str
    slug: str
    logo_url: str | None
    email_domains: str
    contact_email: str | None
    contact_phone: str | None

    model_config = {"from_attributes": True}
