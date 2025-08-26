from datetime import datetime

from app.job.download_job import read_item as job
from app.model.task_record import TaskRecord


def start_download(jm_comic_id: int):
    task = job.delay(jm_comic_id)
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
