from fastapi import APIRouter
from app.fast.service.download_service import download_jm_comic
from app.utils.logger_utils import logger
from app.celery.tasks import long_task
from app.celery.celery_worker import celery_app
from celery.result import AsyncResult

router = APIRouter(prefix="/api/downloads", tags=["item"])


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@router.get("/{jm_comic_id}")
def read_item(jm_comic_id: int, q: str = None):
    url = download_jm_comic(jm_comic_id)
    return {"item_id": jm_comic_id, url: url}


@router.get("/add/{x}/{y}")
async def add(x: int, y: int):
    task = long_task.delay(x, y)  # 提交异步任务
    return {"task_id": task.id}


@router.get("/result/{task_id}")
async def get_result(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    if task_result.ready():
        return {"status": "done", "result": task_result.result}
    return {"status": "pending"}
