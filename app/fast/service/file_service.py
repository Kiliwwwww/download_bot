import os

from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger


def file_size(path):
    with os.scandir(path) as entries:
        files = [entry for entry in entries if entry.is_file()]
    size = len(files)
    logger.info(f"{path}文件数量: {size}")
    return size