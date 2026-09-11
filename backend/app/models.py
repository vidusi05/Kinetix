"""Import all SQLAlchemy models so Alembic can discover the full metadata graph."""

from app.coaching.models import CoachingRelationship
from app.gyms.models import (
    Gym,
    GymAdmin,
    GymAmenity,
    GymBranch,
    GymBranchAmenity,
    GymTrainerAffiliation,
)
from app.trainers.models import (
    TrainerCertification,
    TrainerProfile,
    TrainerProfileSpecialty,
    TrainerSpecialty,
    TrainerVerification,
)
from app.users.models import Role, User, UserRole
from app.workouts.models import (
    ExerciseCatalog,
    ExerciseSet,
    ProgramAssignment,
    ProgramExercise,
    WorkoutProgram,
    WorkoutSession,
    WorkoutSessionExercise,
)

__all__ = [
    "User",
    "Role",
    "UserRole",
    "TrainerProfile",
    "TrainerSpecialty",
    "TrainerProfileSpecialty",
    "TrainerCertification",
    "TrainerVerification",
    "Gym",
    "GymBranch",
    "GymAmenity",
    "GymBranchAmenity",
    "GymAdmin",
    "GymTrainerAffiliation",
    "CoachingRelationship",
    "ExerciseCatalog",
    "WorkoutProgram",
    "ProgramExercise",
    "ProgramAssignment",
    "WorkoutSession",
    "WorkoutSessionExercise",
    "ExerciseSet",
]
