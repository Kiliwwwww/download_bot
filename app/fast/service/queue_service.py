from app.utils.redis_utils import RedisUtils, CELERY_TASK_META
redis_util = RedisUtils()
r = redis_util.redis()


def queue_list():
    return r.scan_iter(f"{CELERY_TASK_META}-*")