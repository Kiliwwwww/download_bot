from fastapi import APIRouter
from app.utils.logger_utils import FileLogger
logger = FileLogger(name="logger")

router = APIRouter(prefix="/api/downloads", tags=["item"])


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@router.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
