import json

from app.utils.logger_utils import logger
from app.utils.redis_utils import RedisUtils, CELERY_TASK_META
from app.utils.yaml_config import config

redis_util = RedisUtils(config.get("server.redis_end"))
r = redis_util.redis()


def queue_list():
    arr = []
    for key in r.scan_iter(f"{CELERY_TASK_META}-*"):
        raw_data = r.get(key)
        if not raw_data:
            continue  # 跳过空值
        try:
            data = json.loads(raw_data)
            arr.append(data)
        except json.JSONDecodeError as e:
            logger.warning(f"解析任务 {key} 的 JSON 失败: {e}")
            # 可选：arr.append({"key": key, "error": str(e), "raw": raw_data})
    return arr