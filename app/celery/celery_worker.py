from app.utils.logger_utils import logger
from app.utils.yaml_config import config
from celery import Celery

redis_url = config.get("server.redis")
redis_end_url = config.get("server.redis_end")
logger.info(redis_url)
celery_app = Celery(
    "worker",
    broker=redis_url,  # Redis 作为消息队列
    backend=redis_end_url,  # 存储任务结果
    include=["app.job"]
)
