import datetime
from pathlib import Path
from time import sleep

from rq import get_current_job

from app.fast.service.file_service import file_size
from app.model.job_item import JobItem, SYNC_FINISHED_COUNT
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
from app.utils.yaml_config import jm_downloader

ROOT_DIR = Path(__file__).resolve().parents[2]

def sync_all_file_finished_count():
    data = []
    try:
        data = TaskRecord.objects().where_expr(TaskRecord.total_count != TaskRecord.finished_count).where_expr(TaskRecord.status != "SUCCESS").pluck("id","item_id")
        if data:
            for task_id, jm_id in data:
                sync_file_size(task_id, jm_id)
    except Exception as e:
        logger.error(str(e))
    JobItem.update_record({"task_type":SYNC_FINISHED_COUNT},status="finished",updated_at=datetime.datetime.now())
    return data

def sync_file_size(task_id, jm_id):
    base_dir = jm_downloader.get("dir_rule.base_dir")
    dir_str = f"{ROOT_DIR}/{base_dir}/{jm_id}"
    logger.info(f"dir_str={dir_str}")
    size = file_size(dir_str)
    TaskRecord.update_record({'id':task_id},finished_count=size)
    return size