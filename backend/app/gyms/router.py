import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.gyms.repository import GymRepository
from app.gyms.schemas import GymListResponse, GymPublic
from app.gyms.service import GymService

router = APIRouter(prefix="/gyms", tags=["gyms"])


def get_gym_service(session: AsyncSession = Depends(get_db_session)) -> GymService:
    return GymService(GymRepository(session))


@router.get("", response_model=GymListResponse)
async def list_gyms(
    service: Annotated[GymService, Depends(get_gym_service)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    city: Annotated[str | None, Query(max_length=120)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> GymListResponse:
    return await service.list_public(query=q, city=city, limit=limit, offset=offset)


@router.get("/{gym_id}", response_model=GymPublic)
async def get_gym(
    gym_id: uuid.UUID,
    service: Annotated[GymService, Depends(get_gym_service)],
) -> GymPublic:
    return await service.get_public(gym_id)
