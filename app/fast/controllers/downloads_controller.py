from fastapi import APIRouter
from app.utils.logger_utils import logger
from app.celery.tasks import read_item as job
from app.celery.celery_worker import celery_app
from celery.result import AsyncResult

router = APIRouter(prefix="/api/downloads", tags=["item"])


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


# 修改成异步任务 常用测试id = 422866
@router.get("/{jm_comic_id}")
def read_item(jm_comic_id: int):
    task = job.delay(jm_comic_id)
    return {"task_id": task.id}


@router.get("/result/{task_id}")
async def get_result(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    if task_result.ready():
        return {"status": "done", "result": task_result.result}
    return {"status": "pending"}
