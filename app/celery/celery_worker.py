from celery import Celery
from app.utils.yaml_config import config

# Redis 配置
redis_url = config.get("server.redis")
redis_end_url = config.get("server.redis_end")

celery_app = Celery(
    "worker",
    broker=redis_url,                # 消息队列
    backend=redis_end_url,           # 任务结果存储
    include=[
        "app.job.download_job",
        "app.job.retry_job"
    ] # 指向具体任务模块
)

# 可选：任务序列化配置
celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
)
