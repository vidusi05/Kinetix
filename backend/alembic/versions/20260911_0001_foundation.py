"""create Kinetix foundation schema

Revision ID: 20260911_0001
Revises:
Create Date: 2026-09-11
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260911_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

UUID = postgresql.UUID(as_uuid=True)
def timestamp_columns() -> tuple[sa.Column, sa.Column]:
    """Return fresh timestamp columns for each Alembic table definition."""
    return (
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("display_name", sa.String(120), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        *timestamp_columns(),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "roles",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("key", sa.String(64), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        *timestamp_columns(),
        sa.UniqueConstraint("key", name="uq_roles_key"),
    )
    op.create_index("ix_roles_key", "roles", ["key"])

    op.create_table(
        "user_roles",
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role_id", UUID, sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("granted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("granted_by_user_id", UUID, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.UniqueConstraint("user_id", "role_id", name="uq_user_roles_membership"),
    )

    op.create_table(
        "trainer_specialties",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        *timestamp_columns(),
        sa.UniqueConstraint("slug", name="uq_trainer_specialties_slug"),
    )
    op.create_index("ix_trainer_specialties_slug", "trainer_specialties", ["slug"])

    op.create_table(
        "trainer_profiles",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("headline", sa.String(160), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("years_experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("hourly_rate", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("verification_status", sa.String(32), nullable=False, server_default="DRAFT"),
        *timestamp_columns(),
        sa.UniqueConstraint("user_id", name="uq_trainer_profiles_user_id"),
        sa.CheckConstraint("years_experience >= 0", name="ck_trainer_profiles_years_experience_nonnegative"),
        sa.CheckConstraint("hourly_rate IS NULL OR hourly_rate >= 0", name="ck_trainer_profiles_hourly_rate_nonnegative"),
        sa.CheckConstraint(
            "verification_status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="ck_trainer_profiles_verification_status_valid",
        ),
    )
    op.create_index("ix_trainer_profiles_user_id", "trainer_profiles", ["user_id"])
    op.create_index("ix_trainer_profiles_verification_status", "trainer_profiles", ["verification_status"])

    op.create_table(
        "trainer_profile_specialties",
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("specialty_id", UUID, sa.ForeignKey("trainer_specialties.id", ondelete="CASCADE"), primary_key=True),
        sa.UniqueConstraint("trainer_profile_id", "specialty_id", name="uq_trainer_specialty"),
    )

    op.create_table(
        "trainer_certifications",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("issuer", sa.String(160), nullable=True),
        sa.Column("credential_id", sa.String(160), nullable=True),
        sa.Column("issued_on", sa.Date(), nullable=True),
        sa.Column("expires_on", sa.Date(), nullable=True),
        sa.Column("verification_status", sa.String(32), nullable=False, server_default="DRAFT"),
        *timestamp_columns(),
    )
    op.create_index("ix_trainer_certifications_trainer_profile_id", "trainer_certifications", ["trainer_profile_id"])

    op.create_table(
        "trainer_verifications",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewer_user_id", UUID, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        *timestamp_columns(),
        sa.CheckConstraint(
            "status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="ck_trainer_verifications_status_valid",
        ),
    )
    op.create_index("ix_trainer_verifications_trainer_profile_id", "trainer_verifications", ["trainer_profile_id"])
    op.create_index("ix_trainer_verifications_status", "trainer_verifications", ["status"])

    op.create_table(
        "gyms",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("verification_status", sa.String(32), nullable=False, server_default="DRAFT"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        *timestamp_columns(),
        sa.CheckConstraint(
            "verification_status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION','APPROVED','REJECTED','SUSPENDED')",
            name="ck_gyms_verification_status_valid",
        ),
    )
    op.create_index("ix_gyms_name", "gyms", ["name"])
    op.create_index("ix_gyms_verification_status", "gyms", ["verification_status"])

    op.create_table(
        "gym_branches",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("gym_id", UUID, sa.ForeignKey("gyms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(120), nullable=False, server_default="Main"),
        sa.Column("address_line1", sa.String(180), nullable=False),
        sa.Column("address_line2", sa.String(180), nullable=True),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("region", sa.String(120), nullable=True),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("monthly_fee", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        *timestamp_columns(),
        sa.UniqueConstraint("gym_id", "name", name="uq_gym_branch_name"),
        sa.CheckConstraint("monthly_fee IS NULL OR monthly_fee >= 0", name="ck_gym_branches_monthly_fee_nonnegative"),
        sa.CheckConstraint("capacity IS NULL OR capacity >= 0", name="ck_gym_branches_capacity_nonnegative"),
    )
    op.create_index("ix_gym_branches_gym_id", "gym_branches", ["gym_id"])
    op.create_index("ix_gym_branches_city", "gym_branches", ["city"])

    op.create_table(
        "gym_amenities",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        *timestamp_columns(),
        sa.UniqueConstraint("slug", name="uq_gym_amenities_slug"),
    )
    op.create_index("ix_gym_amenities_slug", "gym_amenities", ["slug"])

    op.create_table(
        "gym_branch_amenities",
        sa.Column("gym_branch_id", UUID, sa.ForeignKey("gym_branches.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("amenity_id", UUID, sa.ForeignKey("gym_amenities.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "gym_admins",
        sa.Column("gym_id", UUID, sa.ForeignKey("gyms.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("admin_role", sa.String(20), nullable=False, server_default="MANAGER"),
        sa.UniqueConstraint("gym_id", "user_id", name="uq_gym_admin_membership"),
        sa.CheckConstraint("admin_role IN ('OWNER','MANAGER')", name="ck_gym_admins_admin_role_valid"),
    )

    op.create_table(
        "gym_trainer_affiliations",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("gym_id", UUID, sa.ForeignKey("gyms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("gym_display_bio", sa.Text(), nullable=True),
        *timestamp_columns(),
        sa.UniqueConstraint("gym_id", "trainer_profile_id", name="uq_gym_trainer_affiliation"),
        sa.CheckConstraint(
            "status IN ('PENDING','ACTIVE','SUSPENDED','REJECTED','ENDED')",
            name="ck_gym_trainer_affiliations_status_valid",
        ),
    )
    op.create_index("ix_gym_trainer_affiliations_gym_id", "gym_trainer_affiliations", ["gym_id"])
    op.create_index("ix_gym_trainer_affiliations_trainer_profile_id", "gym_trainer_affiliations", ["trainer_profile_id"])

    op.create_table(
        "coaching_relationships",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("client_user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("can_view_workouts", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("can_view_progress", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("can_edit_program", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("can_message", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        *timestamp_columns(),
        sa.CheckConstraint("status IN ('PENDING','ACTIVE','PAUSED','ENDED')", name="ck_coaching_relationships_status_valid"),
    )
    op.create_index("ix_coaching_relationships_client_user_id", "coaching_relationships", ["client_user_id"])
    op.create_index("ix_coaching_relationships_trainer_profile_id", "coaching_relationships", ["trainer_profile_id"])

    op.create_table(
        "exercise_catalog",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("exercise_type", sa.String(20), nullable=False),
        sa.Column("primary_muscle", sa.String(80), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        *timestamp_columns(),
        sa.UniqueConstraint("slug", name="uq_exercise_catalog_slug"),
        sa.CheckConstraint(
            "exercise_type IN ('STRENGTH','BODYWEIGHT','DURATION','DISTANCE','MIXED')",
            name="ck_exercise_catalog_exercise_type_valid",
        ),
    )
    op.create_index("ix_exercise_catalog_slug", "exercise_catalog", ["slug"])
    op.create_index("ix_exercise_catalog_name", "exercise_catalog", ["name"])
    op.create_index("ix_exercise_catalog_primary_muscle", "exercise_catalog", ["primary_muscle"])

    op.create_table(
        "workout_programs",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("owner_user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(32), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_template", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        *timestamp_columns(),
        sa.CheckConstraint("version >= 1", name="ck_workout_programs_version_positive"),
    )
    op.create_index("ix_workout_programs_owner_user_id", "workout_programs", ["owner_user_id"])

    op.create_table(
        "program_exercises",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("program_id", UUID, sa.ForeignKey("workout_programs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("exercise_id", UUID, sa.ForeignKey("exercise_catalog.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("target_sets", sa.Integer(), nullable=True),
        sa.Column("target_reps_min", sa.Integer(), nullable=True),
        sa.Column("target_reps_max", sa.Integer(), nullable=True),
        sa.Column("target_duration_seconds", sa.Integer(), nullable=True),
        sa.Column("target_distance_m", sa.Numeric(12, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *timestamp_columns(),
        sa.UniqueConstraint("program_id", "position", name="uq_program_exercise_position"),
        sa.CheckConstraint("position >= 1", name="ck_program_exercises_position_positive"),
        sa.CheckConstraint("target_sets IS NULL OR target_sets >= 1", name="ck_program_exercises_target_sets_positive"),
        sa.CheckConstraint("target_reps_min IS NULL OR target_reps_min >= 0", name="ck_program_exercises_target_reps_min_nonnegative"),
        sa.CheckConstraint("target_reps_max IS NULL OR target_reps_max >= 0", name="ck_program_exercises_target_reps_max_nonnegative"),
        sa.CheckConstraint(
            "target_reps_min IS NULL OR target_reps_max IS NULL OR target_reps_max >= target_reps_min",
            name="ck_program_exercises_target_rep_range_valid",
        ),
    )
    op.create_index("ix_program_exercises_program_id", "program_exercises", ["program_id"])
    op.create_index("ix_program_exercises_exercise_id", "program_exercises", ["exercise_id"])

    op.create_table(
        "program_assignments",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("program_id", UUID, sa.ForeignKey("workout_programs.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("client_user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trainer_profile_id", UUID, sa.ForeignKey("trainer_profiles.id", ondelete="SET NULL"), nullable=True),
        sa.Column("coaching_relationship_id", UUID, sa.ForeignKey("coaching_relationships.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        *timestamp_columns(),
        sa.CheckConstraint(
            "status IN ('ACTIVE','PAUSED','COMPLETED','CANCELLED')",
            name="ck_program_assignments_status_valid",
        ),
    )
    op.create_index("ix_program_assignments_program_id", "program_assignments", ["program_id"])
    op.create_index("ix_program_assignments_client_user_id", "program_assignments", ["client_user_id"])
    op.create_index("ix_program_assignments_trainer_profile_id", "program_assignments", ["trainer_profile_id"])

    op.create_table(
        "workout_sessions",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("client_user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("program_assignment_id", UUID, sa.ForeignKey("program_assignments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="IN_PROGRESS"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *timestamp_columns(),
        sa.CheckConstraint(
            "status IN ('IN_PROGRESS','COMPLETED','CANCELLED')",
            name="ck_workout_sessions_status_valid",
        ),
    )
    op.create_index("ix_workout_sessions_client_user_id", "workout_sessions", ["client_user_id"])
    op.create_index("ix_workout_sessions_program_assignment_id", "workout_sessions", ["program_assignment_id"])
    op.create_index("ix_workout_sessions_status", "workout_sessions", ["status"])

    op.create_table(
        "workout_session_exercises",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("workout_session_id", UUID, sa.ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("exercise_id", UUID, sa.ForeignKey("exercise_catalog.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("program_exercise_id", UUID, sa.ForeignKey("program_exercises.id", ondelete="SET NULL"), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        *timestamp_columns(),
        sa.UniqueConstraint("workout_session_id", "position", name="uq_session_exercise_position"),
        sa.CheckConstraint("position >= 1", name="ck_workout_session_exercises_position_positive"),
    )
    op.create_index("ix_workout_session_exercises_workout_session_id", "workout_session_exercises", ["workout_session_id"])
    op.create_index("ix_workout_session_exercises_exercise_id", "workout_session_exercises", ["exercise_id"])

    op.create_table(
        "exercise_sets",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("workout_session_exercise_id", UUID, sa.ForeignKey("workout_session_exercises.id", ondelete="CASCADE"), nullable=False),
        sa.Column("set_number", sa.Integer(), nullable=False),
        sa.Column("weight_kg", sa.Numeric(10, 3), nullable=True),
        sa.Column("reps", sa.Integer(), nullable=True),
        sa.Column("rpe", sa.Numeric(3, 1), nullable=True),
        sa.Column("rir", sa.Numeric(3, 1), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("distance_m", sa.Numeric(12, 2), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        *timestamp_columns(),
        sa.UniqueConstraint("workout_session_exercise_id", "set_number", name="uq_exercise_set_number"),
        sa.CheckConstraint("set_number >= 1", name="ck_exercise_sets_set_number_positive"),
        sa.CheckConstraint("weight_kg IS NULL OR weight_kg >= 0", name="ck_exercise_sets_weight_nonnegative"),
        sa.CheckConstraint("reps IS NULL OR reps >= 0", name="ck_exercise_sets_reps_nonnegative"),
        sa.CheckConstraint("rpe IS NULL OR (rpe >= 0 AND rpe <= 10)", name="ck_exercise_sets_rpe_range"),
        sa.CheckConstraint("rir IS NULL OR (rir >= 0 AND rir <= 10)", name="ck_exercise_sets_rir_range"),
        sa.CheckConstraint("duration_seconds IS NULL OR duration_seconds >= 0", name="ck_exercise_sets_duration_nonnegative"),
        sa.CheckConstraint("distance_m IS NULL OR distance_m >= 0", name="ck_exercise_sets_distance_nonnegative"),
    )
    op.create_index("ix_exercise_sets_workout_session_exercise_id", "exercise_sets", ["workout_session_exercise_id"])


def downgrade() -> None:
    op.drop_table("exercise_sets")
    op.drop_table("workout_session_exercises")
    op.drop_table("workout_sessions")
    op.drop_table("program_assignments")
    op.drop_table("program_exercises")
    op.drop_table("workout_programs")
    op.drop_table("exercise_catalog")
    op.drop_table("coaching_relationships")
    op.drop_table("gym_trainer_affiliations")
    op.drop_table("gym_admins")
    op.drop_table("gym_branch_amenities")
    op.drop_table("gym_amenities")
    op.drop_table("gym_branches")
    op.drop_table("gyms")
    op.drop_table("trainer_verifications")
    op.drop_table("trainer_certifications")
    op.drop_table("trainer_profile_specialties")
    op.drop_table("trainer_profiles")
    op.drop_table("trainer_specialties")
    op.drop_table("user_roles")
    op.drop_table("roles")
    op.drop_table("users")
