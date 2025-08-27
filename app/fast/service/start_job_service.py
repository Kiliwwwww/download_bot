from datetime import datetime

from app.job.download_job import read_item as job, retry_item as retry_job
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger


def start_download(jm_comic_id: int):
    logger.info(f"jm_comic_id: {jm_comic_id}")
    task = job.delay(int(jm_comic_id))
    TaskRecord.create_record(task_id=task.id,
                             end_time=datetime.now(),
                             start_time=datetime.now(),
                             status="RUNNING",
                             result={
                                 "item_id": jm_comic_id,
                                 "url": ""
                             },
                             user_id=1)
    return task


# 重试
def retry_download(task_id: str):
    data = TaskRecord.objects().where(task_id=task_id).first()
    if data and data["result"] and data["result"]["item_id"]:
        item = data["result"]["item_id"]
        # logger.info(item)
        retry_job.delay(jm_comic_id=int(item),task_id=str(task_id))
    else:
        logger.info("没有找到数据")
    return str