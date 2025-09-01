from pathlib import Path
from time import sleep

from app.fast.service.file_service import file_size
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
from app.utils.yaml_config import jm_downloader

ROOT_DIR = Path(__file__).resolve().parents[2]

def sync_all_file_finished_count():
    data = TaskRecord.objects().where_expr(TaskRecord.total_count != TaskRecord.finished_count).pluck("id","item_id")
    if data:
        for task_id, jm_id in data:
            sync_file_size(task_id, jm_id)
    return data

def sync_file_size(task_id, jm_id):
    base_dir = jm_downloader.get("dir_rule.base_dir")
    dir_str = f"{ROOT_DIR}/{base_dir}/{jm_id}"
    logger.info(f"dir_str={dir_str}")
    size = file_size(dir_str)
    TaskRecord.update_record({'id':task_id},finished_count=size)
    return size