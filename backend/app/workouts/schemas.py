import uuid

from pydantic import BaseModel, ConfigDict


class ExercisePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    exercise_type: str
    primary_muscle: str | None
    instructions: str | None


class ExerciseListResponse(BaseModel):
    items: list[ExercisePublic]
    total: int
    limit: int
    offset: int
