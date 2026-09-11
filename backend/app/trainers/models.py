import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.models import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.users.models import User

VERIFICATION_STATES = (
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "NEEDS_INFORMATION",
    "APPROVED",
    "REJECTED",
    "SUSPENDED",
)


class TrainerProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "trainer_profiles"
    __table_args__ = (
        CheckConstraint("years_experience >= 0", name="years_experience_nonnegative"),
        CheckConstraint("hourly_rate IS NULL OR hourly_rate >= 0", name="hourly_rate_nonnegative"),
        CheckConstraint(
            "verification_status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="verification_status_valid",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    headline: Mapped[str | None] = mapped_column(String(160), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    years_experience: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    hourly_rate: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="DRAFT", server_default="DRAFT", index=True
    )

    user: Mapped[User] = relationship(lazy="joined")
    specialties: Mapped[list["TrainerSpecialty"]] = relationship(
        secondary="trainer_profile_specialties",
        lazy="selectin",
    )


class TrainerSpecialty(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "trainer_specialties"

    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


class TrainerProfileSpecialty(Base):
    __tablename__ = "trainer_profile_specialties"
    __table_args__ = (
        UniqueConstraint("trainer_profile_id", "specialty_id", name="uq_trainer_specialty"),
    )

    trainer_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_profiles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    specialty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_specialties.id", ondelete="CASCADE"),
        primary_key=True,
    )


class TrainerCertification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "trainer_certifications"

    trainer_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    issuer: Mapped[str | None] = mapped_column(String(160), nullable=True)
    credential_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    issued_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    expires_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="DRAFT", server_default="DRAFT"
    )


class TrainerVerification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "trainer_verifications"
    __table_args__ = (
        CheckConstraint(
            "status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="status_valid",
        ),
    )

    trainer_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewer_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
