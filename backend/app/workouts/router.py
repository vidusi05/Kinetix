from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.workouts.repository import ExerciseRepository
from app.workouts.schemas import ExerciseListResponse
from app.workouts.service import ExerciseService

router = APIRouter(prefix="/exercises", tags=["workouts"])


def get_exercise_service(session: AsyncSession = Depends(get_db_session)) -> ExerciseService:
    return ExerciseService(ExerciseRepository(session))


@router.get("", response_model=ExerciseListResponse)
async def list_exercises(
    service: Annotated[ExerciseService, Depends(get_exercise_service)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    exercise_type: Annotated[str | None, Query(max_length=20)] = None,
    primary_muscle: Annotated[str | None, Query(max_length=80)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ExerciseListResponse:
    return await service.list_active(
        query=q,
        exercise_type=exercise_type,
        primary_muscle=primary_muscle,
        limit=limit,
        offset=offset,
    )
