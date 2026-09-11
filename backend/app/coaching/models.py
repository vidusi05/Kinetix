import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.common.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CoachingRelationship(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "coaching_relationships"
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','ACTIVE','PAUSED','ENDED')",
            name="status_valid",
        ),
    )

    client_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
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
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    can_view_workouts: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    can_view_progress: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    can_edit_program: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    can_message: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
