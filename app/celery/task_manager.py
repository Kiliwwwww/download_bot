# app/utils/task_utils.py
import json
from celery import Celery
from app.utils.logger_utils import logger
from app.utils.paginator import Paginator
from app.utils.redis_utils import RedisUtils, CELERY_TASK_META
from app.utils.yaml_config import config

# Redis 后端
redis_util = RedisUtils(config.get("server.redis_end"))
r = redis_util.redis()

# Celery app (确保和 worker 配置一致)
celery_app = Celery("worker.1", broker=config.get("server.redis"))

class TaskManager:
    @staticmethod
    def completed_tasks():
        """
        获取已完成任务列表
        """
        arr = []
        for key in r.scan_iter(f"{CELERY_TASK_META}-*"):
            raw_data = r.get(key)
            if not raw_data:
                continue
            try:
                data = json.loads(raw_data)
                arr.append(data)
            except json.JSONDecodeError as e:
                logger.warning(f"解析任务 {key} 的 JSON 失败: {e}")

        return arr

    @staticmethod
    def active_tasks():
        """
        获取正在运行的任务列表
        """
        arr = []
        try:
            inspector = celery_app.control.inspect()
            active_tasks = inspector.active()  # {worker_name: [task_dict,...]}
            if active_tasks:
                for worker_name, tasks in active_tasks.items():
                    print(f"Worker: {worker_name}")
                    for task in tasks:
                        arr.append(task)
        except Exception as e:
            logger.error(f"获取正在执行的任务失败: {e}")

        return arr
