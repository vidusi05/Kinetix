import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.trainers.repository import TrainerRepository
from app.trainers.schemas import TrainerListResponse, TrainerPublic
from app.trainers.service import TrainerService

router = APIRouter(prefix="/trainers", tags=["trainers"])


def get_trainer_service(session: AsyncSession = Depends(get_db_session)) -> TrainerService:
    return TrainerService(TrainerRepository(session))


@router.get("", response_model=TrainerListResponse)
async def list_trainers(
    service: Annotated[TrainerService, Depends(get_trainer_service)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    specialty: Annotated[str | None, Query(max_length=80)] = None,
    max_hourly_rate: Annotated[Decimal | None, Query(ge=0)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> TrainerListResponse:
    return await service.list_public(
        query=q,
        specialty=specialty,
        max_hourly_rate=max_hourly_rate,
        limit=limit,
        offset=offset,
    )


@router.get("/{trainer_id}", response_model=TrainerPublic)
async def get_trainer(
    trainer_id: uuid.UUID,
    service: Annotated[TrainerService, Depends(get_trainer_service)],
) -> TrainerPublic:
    return await service.get_public(trainer_id)
