from app.utils.jm_downloader import *
from app.utils.logger_utils import logger
from app.utils.yaml_config import config
import os

# 下载jinman文件
def download_jm_comic(jm_id: int):
    folder_path = config.get("save.dest_dir")
    cache = bool(config.get("save.cache"))
    file_path = os.path.join(folder_path, f"{jm_id}.zip")
    logger.info(f"是否使用缓存: {cache and os.path.exists(file_path) and os.path.isfile(file_path)}")
    # 如果已经下载过文件 并且使用缓存
    if cache and os.path.exists(file_path) and os.path.isfile(file_path):
        return file_path
    else:
        data = download_and_zip(jm_id)
        return data
