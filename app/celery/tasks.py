from app.celery.celery_worker import celery_app
import time


@celery_app.task
def long_task(x, y):
    time.sleep(5)  # 模拟耗时任务
    return x + y
