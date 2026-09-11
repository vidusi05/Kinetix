import uuid
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.trainers.models import TrainerProfile, TrainerSpecialty
from app.users.models import User


class TrainerRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_public(
        self,
        *,
        query: str | None,
        specialty: str | None,
        max_hourly_rate: Decimal | None,
        limit: int,
        offset: int,
    ) -> tuple[list[TrainerProfile], int]:
        filters = [
            TrainerProfile.verification_status == "APPROVED",
            User.is_active.is_(True),
        ]

        if query:
            pattern = f"%{query.strip()}%"
            filters.append(
                or_(
                    User.display_name.ilike(pattern),
                    TrainerProfile.headline.ilike(pattern),
                    TrainerProfile.bio.ilike(pattern),
                )
            )
        if max_hourly_rate is not None:
            filters.append(TrainerProfile.hourly_rate <= max_hourly_rate)

        base = select(TrainerProfile).join(User, User.id == TrainerProfile.user_id)
        count_base = select(func.count(func.distinct(TrainerProfile.id))).join(
            User, User.id == TrainerProfile.user_id
        )

        if specialty:
            base = base.join(
                TrainerProfile.specialties
            ).where(TrainerSpecialty.slug == specialty)
            count_base = count_base.join(
                TrainerProfile.specialties
            ).where(TrainerSpecialty.slug == specialty)

        base = base.where(*filters).order_by(User.display_name.asc()).limit(limit).offset(offset)
        count_base = count_base.where(*filters)

        rows = (await self.session.scalars(base)).unique().all()
        total = int((await self.session.scalar(count_base)) or 0)
        return list(rows), total

    async def get_public(self, trainer_id: uuid.UUID) -> TrainerProfile | None:
        stmt = (
            select(TrainerProfile)
            .join(User, User.id == TrainerProfile.user_id)
            .where(
                TrainerProfile.id == trainer_id,
                TrainerProfile.verification_status == "APPROVED",
                User.is_active.is_(True),
            )
        )
        return (await self.session.scalars(stmt)).unique().one_or_none()
