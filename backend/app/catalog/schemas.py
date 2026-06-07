from pydantic import BaseModel


class DisciplineResponse(BaseModel):
    id: str
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class VenueResponse(BaseModel):
    id: str
    name: str
    address: str | None
    capacity: int

    model_config = {"from_attributes": True}


class ActivityListItem(BaseModel):
    id: str
    name: str
    discipline: str
    venue: str
    schedule_description: str | None
    capacity: int
    enrolled_count: int


class ActivityDetail(BaseModel):
    id: str
    name: str
    description: str | None
    discipline: str
    discipline_id: str
    venue: str
    venue_id: str
    schedule_description: str | None
    capacity: int
    enrolled_count: int
    professor_name: str | None


class ActivityListResponse(BaseModel):
    items: list[ActivityListItem]
    total: int
    page: int
