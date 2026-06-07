from pydantic import BaseModel


class SetupInstitutionRequest(BaseModel):
    name: str
    slug: str
    email_domains: list[str]  # ["unsam.edu.ar", "estudiantes.unsam.edu.ar"]
    admin_email: str
    admin_password: str
    admin_full_name: str


class SetupInstitutionResponse(BaseModel):
    institution_id: str
    admin_user_id: str
    message: str
