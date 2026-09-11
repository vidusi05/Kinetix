import uuid
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Gym(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "gyms"
    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="verification_status_valid",
        ),
    )

    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="DRAFT", server_default="DRAFT", index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    branches: Mapped[list["GymBranch"]] = relationship(
        back_populates="gym", cascade="all, delete-orphan", lazy="selectin"
    )


class GymBranch(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "gym_branches"
    __table_args__ = (
        UniqueConstraint("gym_id", "name", name="uq_gym_branch_name"),
        CheckConstraint("monthly_fee IS NULL OR monthly_fee >= 0", name="monthly_fee_nonnegative"),
        CheckConstraint("capacity IS NULL OR capacity >= 0", name="capacity_nonnegative"),
    )

    gym_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("gyms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False, default="Main", server_default="Main")
    address_line1: Mapped[str] = mapped_column(String(180), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(180), nullable=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    monthly_fee: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    capacity: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    gym: Mapped[Gym] = relationship(back_populates="branches")
    amenities: Mapped[list["GymAmenity"]] = relationship(
        secondary="gym_branch_amenities", lazy="selectin"
    )


class GymAmenity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "gym_amenities"

    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


class GymBranchAmenity(Base):
    __tablename__ = "gym_branch_amenities"

    gym_branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("gym_branches.id", ondelete="CASCADE"),
        primary_key=True,
    )
    amenity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("gym_amenities.id", ondelete="CASCADE"),
        primary_key=True,
    )


class GymAdmin(Base):
    __tablename__ = "gym_admins"
    __table_args__ = (
        UniqueConstraint("gym_id", "user_id", name="uq_gym_admin_membership"),
        CheckConstraint("admin_role IN ('OWNER','MANAGER')", name="admin_role_valid"),
    )

    gym_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("gyms.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    admin_role: Mapped[str] = mapped_column(String(20), nullable=False, default="MANAGER")


class GymTrainerAffiliation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "gym_trainer_affiliations"
    __table_args__ = (
        UniqueConstraint("gym_id", "trainer_profile_id", name="uq_gym_trainer_affiliation"),
        CheckConstraint(
            "status IN ('PENDING','ACTIVE','SUSPENDED','REJECTED','ENDED')",
            name="status_valid",
        ),
    )

    gym_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("gyms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trainer_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", server_default="PENDING")
    gym_display_bio: Mapped[str | None] = mapped_column(Text, nullable=True)
