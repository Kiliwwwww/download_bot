from time import sleep

from celery import current_task

from app.celery.celery_worker import celery_app
from app.fast.service.download_service import download_jm_comic
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
import time


# 下载jm
@celery_app.task
def read_item(jm_comic_id: int):
    logger.info(f"{jm_comic_id}开始下载")
    try:
        url = download_jm_comic(jm_comic_id)
        logger.info("sleep start")
        sleep(20)
        logger.info("sleep end")
        task_id = current_task.request.id
        TaskRecord.update_record({"task_id": task_id}, status="SUCCESS", result={"item_id": jm_comic_id, 'url': url})
        return {"item_id": jm_comic_id, 'url': url}
    except Exception as e:
        logger.error(e)
        TaskRecord.update_record({"task_id": task_id}, status="SUCCESS", result={"item_id": jm_comic_id, 'url': "", 'error': str(e)})
        return {"item_id": jm_comic_id, 'url': "", 'error': str(e)}
