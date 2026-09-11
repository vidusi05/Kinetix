import uuid

from app.core.exceptions import NotFoundError
from app.gyms.models import Gym
from app.gyms.repository import GymRepository
from app.gyms.schemas import AmenityPublic, GymBranchPublic, GymListResponse, GymPublic


class GymService:
    def __init__(self, repository: GymRepository) -> None:
        self.repository = repository

    @staticmethod
    def _to_public(gym: Gym) -> GymPublic:
        branches = [
            GymBranchPublic(
                id=branch.id,
                name=branch.name,
                address_line1=branch.address_line1,
                address_line2=branch.address_line2,
                city=branch.city,
                region=branch.region,
                country_code=branch.country_code,
                latitude=branch.latitude,
                longitude=branch.longitude,
                monthly_fee=branch.monthly_fee,
                currency=branch.currency,
                amenities=[AmenityPublic.model_validate(item) for item in branch.amenities],
            )
            for branch in gym.branches
            if branch.is_active
        ]
        return GymPublic(
            id=gym.id,
            name=gym.name,
            description=gym.description,
            branches=branches,
        )

    async def list_public(
        self,
        *,
        query: str | None,
        city: str | None,
        limit: int,
        offset: int,
    ) -> GymListResponse:
        gyms, total = await self.repository.list_public(
            query=query,
            city=city,
            limit=limit,
            offset=offset,
        )
        return GymListResponse(
            items=[self._to_public(gym) for gym in gyms],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def get_public(self, gym_id: uuid.UUID) -> GymPublic:
        gym = await self.repository.get_public(gym_id)
        if gym is None:
            raise NotFoundError("Gym was not found.", code="gym_not_found")
        return self._to_public(gym)
