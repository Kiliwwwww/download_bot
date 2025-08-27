from datetime import datetime

from app.fast.service.download_service import download_jm_comic
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger


def download(jm_comic_id: int, task_id: str):
    try:
        url = download_jm_comic(jm_comic_id)
    except Exception as e:
        logger.info(str(e))
        TaskRecord.update_record({"task_id": task_id}, status="ERROR", end_time=datetime.now(),
                                 result={"item_id": jm_comic_id, 'url': "", 'error': str(e)})
        return {"item_id": jm_comic_id, 'url': "", 'error': str(e)}
    TaskRecord.update_record({"task_id": task_id}, status="SUCCESS", end_time=datetime.now(), result={"item_id": jm_comic_id, 'url': url})
    return {"item_id": jm_comic_id, 'url': url}