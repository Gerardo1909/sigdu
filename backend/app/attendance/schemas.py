from datetime import date

from pydantic import BaseModel


class AttendanceRecordItem(BaseModel):
    user_id: str
    present: bool


class BulkAttendanceRequest(BaseModel):
    class_session_id: str
    records: list[AttendanceRecordItem]


class AttendanceSummary(BaseModel):
    total: int
    present: int
    absent: int
    percentage: float


class EnrolledStudent(BaseModel):
    user_id: str
    full_name: str
    email: str


class ClassSessionResponse(BaseModel):
    id: str
    activity_id: str
    activity_name: str
    date: date
    enrolled_students: list[EnrolledStudent]
