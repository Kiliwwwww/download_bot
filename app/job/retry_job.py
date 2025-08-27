from app.celery.celery_worker import celery_app
from app.utils.logger_utils import logger
from app.job.tools import download



@celery_app.task
def retry_item(jm_comic_id: int,task_id: str):
    logger.info(f"{jm_comic_id}重新下载")
    logger.info(f"重试的task_id: {task_id}")
    return download(jm_comic_id=jm_comic_id, task_id=task_id)