import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.gyms.models import Gym, GymBranch


class GymRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_public(
        self,
        *,
        query: str | None,
        city: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Gym], int]:
        filters = [Gym.verification_status == "APPROVED", Gym.is_active.is_(True)]
        stmt = select(Gym).join(GymBranch).where(GymBranch.is_active.is_(True))
        count_stmt = select(func.count(func.distinct(Gym.id))).join(GymBranch).where(
            GymBranch.is_active.is_(True)
        )

        if query:
            pattern = f"%{query.strip()}%"
            filters.append(or_(Gym.name.ilike(pattern), Gym.description.ilike(pattern)))
        if city:
            filters.append(GymBranch.city.ilike(city.strip()))

        stmt = stmt.where(*filters).distinct().order_by(Gym.name.asc()).limit(limit).offset(offset)
        count_stmt = count_stmt.where(*filters)

        rows = (await self.session.scalars(stmt)).unique().all()
        total = int((await self.session.scalar(count_stmt)) or 0)
        return list(rows), total

    async def get_public(self, gym_id: uuid.UUID) -> Gym | None:
        stmt = select(Gym).where(
            Gym.id == gym_id,
            Gym.verification_status == "APPROVED",
            Gym.is_active.is_(True),
        )
        return (await self.session.scalars(stmt)).unique().one_or_none()
