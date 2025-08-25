import json

from app.utils.logger_utils import logger
from app.utils.redis_utils import RedisUtils, CELERY_TASK_META
from app.utils.yaml_config import config

redis_util = RedisUtils(config.get("server.redis_end"))
r = redis_util.redis()


def queue_list(page=1, per_page=20, sort_key="date_done", reverse=True):
    """
    获取任务队列列表（支持排序 + 分页）
    :param page: 当前页码，从 1 开始
    :param per_page: 每页数量
    :param sort_key: 排序字段（任务 JSON 中的字段）
    :param reverse: 是否倒序（默认 True = 新任务在前）
    :return: dict {total: 总数, page: 当前页, per_page: 每页数量, items: 列表}
    """
    arr = []
    for key in r.scan_iter(f"{CELERY_TASK_META}-*"):
        raw_data = r.get(key)
        if not raw_data:
            continue
        try:
            data = json.loads(raw_data)
            data["_redis_key"] = key.decode() if isinstance(key, bytes) else key  # 方便调试
            arr.append(data)
        except json.JSONDecodeError as e:
            logger.warning(f"解析任务 {key} 的 JSON 失败: {e}")


    # 排序（如果 sort_key 不存在，就退化成按 redis key 排序）
    arr.sort(
        key=lambda x: x.get(sort_key, x.get("_redis_key", "")),
        reverse=reverse
    )

    # 分页
    total = len(arr)
    start = (page - 1) * per_page
    end = start + per_page
    items = arr[start:end]

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }
