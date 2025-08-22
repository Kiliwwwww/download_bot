from app.utils.jm_downloader import *
from app.utils.logger_utils import logger


# 下载jinman文件
def download_jm_comic(jm_id: int):
    logger.info("=====下载开始=====")
    data = download_and_zip(jm_id)
    logger.info("=====下载结束=====")
    return data

