from time import sleep

from celery import current_task

from app.celery.celery_worker import celery_app
from app.fast.service.download_service import download_jm_comic
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
import time


def download(jm_comic_id: int, task_id: str):
    try:
        url = download_jm_comic(jm_comic_id)
    except Exception as e:
        logger.info(str(e))
        TaskRecord.update_record({"task_id": task_id}, status="ERROR",
                                 result={"item_id": jm_comic_id, 'url': "", 'error': str(e)})
        return {"item_id": jm_comic_id, 'url': "", 'error': str(e)}
    TaskRecord.update_record({"task_id": task_id}, status="SUCCESS", result={"item_id": jm_comic_id, 'url': url})
    return {"item_id": jm_comic_id, 'url': url}

# 下载jm
@celery_app.task
def read_item(jm_comic_id: int):
    logger.info(f"{jm_comic_id}开始下载")
    task_id = current_task.request.id
    logger.info(f"task_id: {task_id}")
    return download(jm_comic_id=jm_comic_id, task_id=task_id)


@celery_app.task
def retry_item(jm_comic_id: int,task_id: str):
    logger.info(f"{jm_comic_id}重新下载")
    logger.info(f"重试的task_id: {task_id}")
    return download(jm_comic_id=jm_comic_id, task_id=task_id)