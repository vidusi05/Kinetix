import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SpecialtyPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str


class TrainerPublic(BaseModel):
    id: uuid.UUID
    display_name: str
    headline: str | None
    bio: str | None
    years_experience: int
    hourly_rate: Decimal | None
    currency: str | None
    specialties: list[SpecialtyPublic]
    verified: bool = True


class TrainerListResponse(BaseModel):
    items: list[TrainerPublic]
    total: int
    limit: int
    offset: int
