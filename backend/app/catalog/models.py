from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.auth.models import User


class Discipline(Base):
    __tablename__ = "disciplines"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    activities: Mapped[list["Activity"]] = relationship("Activity", back_populates="discipline")


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    activities: Mapped[list["Activity"]] = relationship("Activity", back_populates="venue")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    schedule_description: Mapped[str | None] = mapped_column(String, nullable=True)

    discipline_id: Mapped[str] = mapped_column(String, ForeignKey("disciplines.id"), nullable=False)
    venue_id: Mapped[str] = mapped_column(String, ForeignKey("venues.id"), nullable=False)
    professor_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    discipline: Mapped["Discipline"] = relationship("Discipline", back_populates="activities")
    venue: Mapped["Venue"] = relationship("Venue", back_populates="activities")
    professor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[professor_id])
    enrollments: Mapped[list["Enrollment"]] = relationship("Enrollment", back_populates="activity")


class EnrollmentStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    activity_id: Mapped[str] = mapped_column(String, ForeignKey("activities.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="active")
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    activity: Mapped["Activity"] = relationship("Activity", back_populates="enrollments")
