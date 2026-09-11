import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class AmenityPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str


class GymBranchPublic(BaseModel):
    id: uuid.UUID
    name: str
    address_line1: str
    address_line2: str | None
    city: str
    region: str | None
    country_code: str
    latitude: Decimal | None
    longitude: Decimal | None
    monthly_fee: Decimal | None
    currency: str | None
    amenities: list[AmenityPublic]


class GymPublic(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    branches: list[GymBranchPublic]
    verified: bool = True


class GymListResponse(BaseModel):
    items: list[GymPublic]
    total: int
    limit: int
    offset: int
