from app.celery.celery_worker import celery_app
from app.fast.service.download_service import download_jm_comic
from app.utils.logger_utils import logger
import time


# 下载jm
@celery_app.task
def read_item(jm_comic_id: int):
    logger.info(f"{jm_comic_id}开始下载")
    try:
        url = download_jm_comic(jm_comic_id)
        return {"item_id": jm_comic_id, 'url': url}
    except Exception as e:
        logger.error(e)
        return {"item_id": jm_comic_id, 'url': "", "error": str(e)}



