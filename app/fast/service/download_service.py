from app.utils.jm_downloader import *
from app.utils.logger_utils import logger
from app.utils.yaml_config import config
import os
from app.utils.redis_utils import RedisUtils, JM_KEY
redis_util = RedisUtils()


# 下载jinman文件
def download_jm_comic(jm_id: int):
    folder_path = config.get("save.dest_dir")
    cache = bool(config.get("save.cache"))
    jm_id = correspond_to(jm_id)
    file_path = os.path.join(folder_path, f"{jm_id}.zip")
    use_cache = cache and os.path.exists(file_path) and os.path.isfile(file_path)
    logger.info(f"是否使用缓存: {use_cache}")
    # 如果已经下载过文件 并且使用缓存
    if use_cache:
        return file_path
    else:
        data = download_and_zip(jm_id)
        return data

def correspond_to(jm_id: int):
    var_dict = redis_util.hgetall(JM_KEY)
    var = var_dict.get(f"{jm_id}")
    if var is None:
        return jm_id
    else:
        return var
