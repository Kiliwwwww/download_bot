from datetime import datetime

from app.fast.service.jm_service import get_item
from app.task.download_task import download_item
from app.model.task_record import TaskRecord
from app.rq.rq_utils import RQManager
from app.task.retry_task import retry_item
from app.utils.logger_utils import logger
rq_manager = RQManager()

def start_download(jm_comic_id: int):
    logger.info(f"jm_comic_id: {jm_comic_id}")
    job = TaskRecord.objects().where(item_id=jm_comic_id,status="RUNNING").to_dict()
    if job:
        raise Exception("任务进行中请勿重新提交")
    jm_comic_data = get_item(jm_comic_id)
    if jm_comic_data is None:
        return jm_comic_id

    page_count = int(jm_comic_data['page_count'])
    name = jm_comic_data['name']
    rq = rq_manager.enqueue(download_item, int(jm_comic_id))
    task_id = str(rq.id)
    logger.info(task_id)
    TaskRecord.create_record(task_id=task_id,
                             start_time=datetime.now(),
                             status="RUNNING",
                             result={
                                 "item_id": jm_comic_id,
                                 "url": ""
                             },
                             item_id=jm_comic_id,
                             user_id=1,
                             total_count=page_count,
                             finished_count=0,
                             name=name)
    return task_id


# 重试
def retry_download(task_id: str):
    data = TaskRecord.objects().where(task_id=task_id).first()
    if data and data["result"] and data["result"]["item_id"]:
        item = data["result"]["item_id"]
        # logger.info(item)
        # retry_job.delay(jm_comic_id=int(item),task_id=str(task_id))
        rq = rq_manager.enqueue(retry_item, int(item),str(task_id))
        task_id = str(rq.id)
        logger.info(task_id)
    else:
        logger.info("没有找到数据")
    return str