from celery import current_task
from app.celery.celery_worker import celery_app
from app.job.tools import download
from app.utils.logger_utils import logger




# 下载jm
@celery_app.task
def read_item(jm_comic_id: int):
    logger.info(f"{jm_comic_id}开始下载")
    task_id = current_task.request.id
    logger.info(f"task_id: {task_id}")
    return download(jm_comic_id=jm_comic_id, task_id=task_id)


