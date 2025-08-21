from fastapi import APIRouter

from app.fast.service.download_service import download_jm_comic
from app.utils.logger_utils import logger

router = APIRouter(prefix="/api/downloads", tags=["item"])


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@router.get("/{jm_comic_id}")
def read_item(jm_comic_id: int, q: str = None):
    url = download_jm_comic(jm_comic_id)
    return {"item_id": jm_comic_id, url: url}
