from fastapi import APIRouter

from app.gyms.router import router as gyms_router
from app.health.router import router as health_router
from app.trainers.router import router as trainers_router
from app.workouts.router import router as workouts_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(trainers_router)
api_router.include_router(gyms_router)
api_router.include_router(workouts_router)
