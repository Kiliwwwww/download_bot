from app.task.tools import download
from app.utils.logger_utils import logger

from rq import get_current_job

def download_item(jm_comic_id: int):
    logger.info(f"{jm_comic_id}开始下载")
    task_id = get_current_job().get_id()
    logger.info(f"task_id: {task_id}")
    return download(jm_comic_id=jm_comic_id, task_id=task_id)


