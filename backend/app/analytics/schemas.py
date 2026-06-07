from pydantic import BaseModel


class EnrollmentOverTime(BaseModel):
    date: str  # formato "YYYY-MM-DD" (agrupado por semana)
    count: int


class AttendanceByActivity(BaseModel):
    activity_name: str
    avg_rate: float  # porcentaje 0-100, 2 decimales
    total_sessions: int


class EnrollmentByDiscipline(BaseModel):
    discipline_name: str
    count: int


class AnalyticsCharts(BaseModel):
    enrollments_over_time: list[EnrollmentOverTime]
    attendance_by_activity: list[AttendanceByActivity]
    enrollments_by_discipline: list[EnrollmentByDiscipline]


class AnalyticsDashboardResponse(BaseModel):
    total_enrollments: int
    avg_attendance_rate: float  # porcentaje global 0-100
    active_activities: int
    total_students: int
    charts: AnalyticsCharts
