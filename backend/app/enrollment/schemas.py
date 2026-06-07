from datetime import datetime

from pydantic import BaseModel


class EnrollRequest(BaseModel):
    activity_id: str


class EnrollResponse(BaseModel):
    id: str
    activity_id: str
    activity_name: str
    status: str
    enrolled_at: datetime

    model_config = {"from_attributes": True}


class MyEnrollmentsResponse(BaseModel):
    enrollments: list[EnrollResponse]
    total: int
