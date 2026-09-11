import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.database import AsyncSessionFactory
from app.gyms.models import Gym, GymAmenity, GymBranch, GymBranchAmenity
from app.trainers.models import (
    TrainerProfile,
    TrainerProfileSpecialty,
    TrainerSpecialty,
)
from app.users.models import Role, User, UserRole
from app.workouts.models import ExerciseCatalog


async def get_or_create_role(session, key: str, display_name: str) -> Role:
    role = await session.scalar(select(Role).where(Role.key == key))
    if role is None:
        role = Role(key=key, display_name=display_name)
        session.add(role)
        await session.flush()
    return role


async def get_or_create_user(session, email: str, display_name: str) -> User:
    user = await session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, display_name=display_name)
        session.add(user)
        await session.flush()
    return user


async def seed() -> None:
    async with AsyncSessionFactory() as session:
        client_role = await get_or_create_role(session, "CLIENT", "Client")
        trainer_role = await get_or_create_role(session, "TRAINER", "Trainer")
        await get_or_create_role(session, "GYM_ADMIN", "Gym admin")
        await get_or_create_role(session, "PLATFORM_ADMIN", "Platform admin")

        specialty_data = {
            "strength-powerlifting": "Strength & Powerlifting",
            "hiit-conditioning": "HIIT & Conditioning",
            "bodybuilding-aesthetics": "Bodybuilding & Aesthetics",
        }
        specialties: dict[str, TrainerSpecialty] = {}
        for slug, name in specialty_data.items():
            item = await session.scalar(
                select(TrainerSpecialty).where(TrainerSpecialty.slug == slug)
            )
            if item is None:
                item = TrainerSpecialty(slug=slug, name=name)
                session.add(item)
                await session.flush()
            specialties[slug] = item

        trainer_seed = [
            (
                "marcus@kinetix.local",
                "Coach Marcus Vance",
                "Strength coach specializing in competitive powerlifting",
                8,
                Decimal("75.00"),
                "USD",
                "strength-powerlifting",
            ),
            (
                "elena@kinetix.local",
                "Sergeant Elena Rostova",
                "Conditioning coach focused on endurance and HIIT",
                12,
                Decimal("90.00"),
                "USD",
                "hiit-conditioning",
            ),
            (
                "drake@kinetix.local",
                "Drake Harrison",
                "Hypertrophy and physique programming coach",
                5,
                Decimal("65.00"),
                "USD",
                "bodybuilding-aesthetics",
            ),
        ]

        for email, name, headline, years, rate, currency, specialty_slug in trainer_seed:
            user = await get_or_create_user(session, email, name)
            membership = await session.scalar(
                select(UserRole).where(
                    UserRole.user_id == user.id,
                    UserRole.role_id == trainer_role.id,
                )
            )
            if membership is None:
                session.add(UserRole(user_id=user.id, role_id=trainer_role.id))

            profile = await session.scalar(
                select(TrainerProfile).where(TrainerProfile.user_id == user.id)
            )
            if profile is None:
                profile = TrainerProfile(
                    user_id=user.id,
                    headline=headline,
                    years_experience=years,
                    hourly_rate=rate,
                    currency=currency,
                    verification_status="APPROVED",
                )
                session.add(profile)
                await session.flush()

            link = await session.scalar(
                select(TrainerProfileSpecialty).where(
                    TrainerProfileSpecialty.trainer_profile_id == profile.id,
                    TrainerProfileSpecialty.specialty_id == specialties[specialty_slug].id,
                )
            )
            if link is None:
                session.add(
                    TrainerProfileSpecialty(
                        trainer_profile_id=profile.id,
                        specialty_id=specialties[specialty_slug].id,
                    )
                )

        client = await get_or_create_user(session, "client@kinetix.local", "Aesthetic Lifter")
        client_membership = await session.scalar(
            select(UserRole).where(
                UserRole.user_id == client.id,
                UserRole.role_id == client_role.id,
            )
        )
        if client_membership is None:
            session.add(UserRole(user_id=client.id, role_id=client_role.id))

        for slug, name in [
            ("sauna-steam", "Sauna & Steam"),
            ("cold-plunge", "Cold Plunge"),
            ("boxing-ring", "Boxing Ring"),
            ("pt-zone", "PT Dedicated Zone"),
        ]:
            amenity = await session.scalar(select(GymAmenity).where(GymAmenity.slug == slug))
            if amenity is None:
                session.add(GymAmenity(slug=slug, name=name))

        if await session.scalar(select(Gym).where(Gym.name == "Iron Forge Athletics")) is None:
            gym = Gym(
                name="Iron Forge Athletics",
                description="Development seed facility for the prototype discovery flow.",
                verification_status="APPROVED",
            )
            session.add(gym)
            await session.flush()
            session.add(
                GymBranch(
                    gym_id=gym.id,
                    name="Main",
                    address_line1="Prototype address",
                    city="Colombo",
                    country_code="LK",
                    monthly_fee=Decimal("49.00"),
                    currency="USD",
                )
            )

        exercise_seed = [
            ("barbell-bench-press", "Barbell Bench Press", "STRENGTH", "Chest"),
            ("incline-dumbbell-press", "Incline Dumbbell Chest Press", "STRENGTH", "Chest"),
            ("overhead-barbell-press", "Overhead Barbell Press", "STRENGTH", "Shoulders"),
            ("weighted-pullups", "Weighted Pullups", "BODYWEIGHT", "Back"),
            ("barbell-back-squat", "Barbell Back Squat", "STRENGTH", "Legs"),
            ("romanian-deadlift", "Romanian Deadlift", "STRENGTH", "Hamstrings"),
        ]
        for slug, name, exercise_type, muscle in exercise_seed:
            existing = await session.scalar(
                select(ExerciseCatalog).where(ExerciseCatalog.slug == slug)
            )
            if existing is None:
                session.add(
                    ExerciseCatalog(
                        slug=slug,
                        name=name,
                        exercise_type=exercise_type,
                        primary_muscle=muscle,
                    )
                )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
