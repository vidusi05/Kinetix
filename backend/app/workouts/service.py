from app.workouts.repository import ExerciseRepository
from app.workouts.schemas import ExerciseListResponse, ExercisePublic


class ExerciseService:
    def __init__(self, repository: ExerciseRepository) -> None:
        self.repository = repository

    async def list_active(
        self,
        *,
        query: str | None,
        exercise_type: str | None,
        primary_muscle: str | None,
        limit: int,
        offset: int,
    ) -> ExerciseListResponse:
        items, total = await self.repository.list_active(
            query=query,
            exercise_type=exercise_type,
            primary_muscle=primary_muscle,
            limit=limit,
            offset=offset,
        )
        return ExerciseListResponse(
            items=[ExercisePublic.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )
