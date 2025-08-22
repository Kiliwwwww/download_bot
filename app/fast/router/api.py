from fastapi import APIRouter
from app.fast.controller.downloads_controller import downloads_router
from app.fast.controller.tasks_controller import tasks_router
api_router = APIRouter(prefix="/api")
api_router.include_router(downloads_router)
api_router.include_router(tasks_router)