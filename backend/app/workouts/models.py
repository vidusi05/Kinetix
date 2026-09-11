import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.common.models import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ExerciseCatalog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "exercise_catalog"
    __table_args__ = (
        CheckConstraint(
            "exercise_type IN ('STRENGTH','BODYWEIGHT','DURATION','DISTANCE','MIXED')",
            name="exercise_type_valid",
        ),
    )

    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    exercise_type: Mapped[str] = mapped_column(String(20), nullable=False)
    primary_muscle: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")


class WorkoutProgram(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "workout_programs"
    __table_args__ = (
        CheckConstraint("version >= 1", name="version_positive"),
    )

    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(32), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    is_template: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_archived: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")


class ProgramExercise(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "program_exercises"
    __table_args__ = (
        UniqueConstraint("program_id", "position", name="uq_program_exercise_position"),
        CheckConstraint("position >= 1", name="position_positive"),
        CheckConstraint("target_sets IS NULL OR target_sets >= 1", name="target_sets_positive"),
        CheckConstraint("target_reps_min IS NULL OR target_reps_min >= 0", name="target_reps_min_nonnegative"),
        CheckConstraint("target_reps_max IS NULL OR target_reps_max >= 0", name="target_reps_max_nonnegative"),
        CheckConstraint(
            "target_reps_min IS NULL OR target_reps_max IS NULL OR target_reps_max >= target_reps_min",
            name="target_rep_range_valid",
        ),
    )

    program_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workout_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercise_catalog.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    target_sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_reps_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_reps_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_distance_m: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class ProgramAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "program_assignments"
    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE','PAUSED','COMPLETED','CANCELLED')", name="status_valid"),
    )

    program_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workout_programs.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    client_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trainer_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trainer_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    coaching_relationship_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("coaching_relationships.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE", server_default="ACTIVE")


class WorkoutSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "workout_sessions"
    __table_args__ = (
        CheckConstraint("status IN ('IN_PROGRESS','COMPLETED','CANCELLED')", name="status_valid"),
    )

    client_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    program_assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("program_assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="IN_PROGRESS", server_default="IN_PROGRESS", index=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class WorkoutSessionExercise(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "workout_session_exercises"
    __table_args__ = (
        UniqueConstraint("workout_session_id", "position", name="uq_session_exercise_position"),
        CheckConstraint("position >= 1", name="position_positive"),
    )

    workout_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercise_catalog.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    program_exercise_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("program_exercises.id", ondelete="SET NULL"),
        nullable=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class ExerciseSet(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "exercise_sets"
    __table_args__ = (
        UniqueConstraint("workout_session_exercise_id", "set_number", name="uq_exercise_set_number"),
        CheckConstraint("set_number >= 1", name="set_number_positive"),
        CheckConstraint("weight_kg IS NULL OR weight_kg >= 0", name="weight_nonnegative"),
        CheckConstraint("reps IS NULL OR reps >= 0", name="reps_nonnegative"),
        CheckConstraint("rpe IS NULL OR (rpe >= 0 AND rpe <= 10)", name="rpe_range"),
        CheckConstraint("rir IS NULL OR (rir >= 0 AND rir <= 10)", name="rir_range"),
        CheckConstraint("duration_seconds IS NULL OR duration_seconds >= 0", name="duration_nonnegative"),
        CheckConstraint("distance_m IS NULL OR distance_m >= 0", name="distance_nonnegative"),
    )

    workout_session_exercise_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workout_session_exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rpe: Mapped[Decimal | None] = mapped_column(Numeric(3, 1), nullable=True)
    rir: Mapped[Decimal | None] = mapped_column(Numeric(3, 1), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    distance_m: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
