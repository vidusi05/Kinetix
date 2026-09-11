import uuid
from decimal import Decimal

from app.core.exceptions import NotFoundError
from app.trainers.models import TrainerProfile
from app.trainers.repository import TrainerRepository
from app.trainers.schemas import SpecialtyPublic, TrainerListResponse, TrainerPublic


class TrainerService:
    def __init__(self, repository: TrainerRepository) -> None:
        self.repository = repository

    @staticmethod
    def _to_public(profile: TrainerProfile) -> TrainerPublic:
        return TrainerPublic(
            id=profile.id,
            display_name=profile.user.display_name,
            headline=profile.headline,
            bio=profile.bio,
            years_experience=profile.years_experience,
            hourly_rate=profile.hourly_rate,
            currency=profile.currency,
            specialties=[SpecialtyPublic.model_validate(item) for item in profile.specialties],
        )

    async def list_public(
        self,
        *,
        query: str | None,
        specialty: str | None,
        max_hourly_rate: Decimal | None,
        limit: int,
        offset: int,
    ) -> TrainerListResponse:
        profiles, total = await self.repository.list_public(
            query=query,
            specialty=specialty,
            max_hourly_rate=max_hourly_rate,
            limit=limit,
            offset=offset,
        )
        return TrainerListResponse(
            items=[self._to_public(profile) for profile in profiles],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def get_public(self, trainer_id: uuid.UUID) -> TrainerPublic:
        profile = await self.repository.get_public(trainer_id)
        if profile is None:
            raise NotFoundError("Trainer was not found.", code="trainer_not_found")
        return self._to_public(profile)
