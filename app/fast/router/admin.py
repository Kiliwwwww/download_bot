from fastapi import APIRouter
from app.fast.controller.admin.pages_controller import pages_router

admin_router = APIRouter(prefix="/admins")
admin_router.include_router(pages_router)
