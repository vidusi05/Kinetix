from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.workouts.models import ExerciseCatalog


class ExerciseRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_active(
        self,
        *,
        query: str | None,
        exercise_type: str | None,
        primary_muscle: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[ExerciseCatalog], int]:
        filters = [ExerciseCatalog.is_active.is_(True)]
        if query:
            pattern = f"%{query.strip()}%"
            filters.append(
                or_(ExerciseCatalog.name.ilike(pattern), ExerciseCatalog.slug.ilike(pattern))
            )
        if exercise_type:
            filters.append(ExerciseCatalog.exercise_type == exercise_type.upper())
        if primary_muscle:
            filters.append(ExerciseCatalog.primary_muscle.ilike(primary_muscle.strip()))

        stmt = (
            select(ExerciseCatalog)
            .where(*filters)
            .order_by(ExerciseCatalog.name.asc())
            .limit(limit)
            .offset(offset)
        )
        count_stmt = select(func.count(ExerciseCatalog.id)).where(*filters)
        items = list((await self.session.scalars(stmt)).all())
        total = int((await self.session.scalar(count_stmt)) or 0)
        return items, total
