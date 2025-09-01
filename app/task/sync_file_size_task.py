from pathlib import Path

from app.fast.service.file_service import file_size
from app.model.task_record import TaskRecord
from app.utils.yaml_config import jm_downloader

ROOT_DIR = Path(__file__).resolve().parents[2]


def sync_file_size(jm_id):
    base_dir = jm_downloader.get("dir_rule.base_dir")
    dir_str = f"{ROOT_DIR}/{base_dir}/{jm_id}"
    size = file_size(dir_str)
    TaskRecord.update_record({id})
    return size