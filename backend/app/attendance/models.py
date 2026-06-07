from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.catalog.models import Activity
    from app.auth.models import User


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    activity_id: Mapped[str] = mapped_column(
        String, ForeignKey("activities.id"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    created_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )

    activity: Mapped["Activity"] = relationship("Activity", foreign_keys=[activity_id])
    creator: Mapped["User | None"] = relationship("User", foreign_keys=[created_by])
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(
        "AttendanceRecord", back_populates="class_session"
    )


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    class_session_id: Mapped[str] = mapped_column(
        String, ForeignKey("class_sessions.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    present: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    class_session: Mapped["ClassSession"] = relationship(
        "ClassSession", back_populates="attendance_records"
    )
