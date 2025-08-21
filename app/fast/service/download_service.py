from app.utils.jm_downloader import *
from app.utils.logger_utils import logger



# 下载jinman文件
def download_jmcomic(jm_id: int):
    return download_and_zip(jm_id)

