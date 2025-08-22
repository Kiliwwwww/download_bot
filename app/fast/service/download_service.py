from app.utils.jm_downloader import *
from app.utils.logger_utils import logger
from app.utils.yaml_config import config, jm_downloader
import os
import shutil
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


def clear_cache():
    """删除指定目录及其所有内容，并重新创建books目录"""
    # 获取要清理的目录路径
    dest_dir = config.get("save.dest_dir")
    # 获取books目录路径
    books_dir = jm_downloader.get("dir_rule.base_dir")

    # 要清理的目录列表
    directories_to_clear = [dest_dir, books_dir]

    for dir_path in directories_to_clear:
        # 检查目录是否存在
        if not os.path.exists(dir_path):
            print(f"目录不存在，跳过删除: {dir_path}")
            continue

        if not os.path.isdir(dir_path):
            print(f"路径不是目录，跳过删除: {dir_path}")
            continue

        try:
            # 完全删除目录及其所有内容
            shutil.rmtree(dir_path)
            print(f"已完全删除目录及其内容: {dir_path}")

        except Exception as e:
            print(f"删除目录 {dir_path} 时出错: {str(e)}")

    # 重新创建books目录
    try:
        os.makedirs(books_dir, exist_ok=True)
        os.makedirs(dest_dir, exist_ok=True)
        print(f"已创建空的books目录: {books_dir}")
    except Exception as e:
        print(f"创建books目录 {books_dir} 时出错: {str(e)}")





def correspond_to(jm_id: int):
    var_dict = redis_util.hgetall(JM_KEY)
    var = var_dict.get(f"{jm_id}")
    if var is None:
        return jm_id
    else:
        return var
