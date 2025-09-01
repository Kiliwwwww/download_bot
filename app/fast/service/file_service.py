import os
from app.utils.logger_utils import logger

def file_size(path):
    total_files = 0

    def count_files(dir_path):
        nonlocal total_files
        with os.scandir(dir_path) as entries:
            for entry in entries:
                if entry.is_file():
                    total_files += 1
                elif entry.is_dir():
                    count_files(entry.path)  # 递归子目录

    count_files(path)
    logger.info(f"{path} 文件总数量（含子目录）: {total_files}")
    return total_files
