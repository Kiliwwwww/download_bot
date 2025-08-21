from fastapi import APIRouter
from app.utils.logger_utils import logger

router = APIRouter(prefix="/api/downloads", tags=["item"])


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@router.get("/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": "?211222"}
