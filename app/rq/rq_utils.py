from rq import Queue
from redis import Redis
from rq.job import Job
from rq.registry import StartedJobRegistry, FinishedJobRegistry, FailedJobRegistry

from app.utils.yaml_config import config


class RQManager:
    def __init__(self, default_queue="download"):
        """
        初始化 RQManager
        :param default_queue: 默认队列名称
        """
        redis_url = config.get("server.redis")
        self.redis_conn = Redis.from_url(redis_url)
        self.queues = {}
        self.default_queue = default_queue

    def is_task_finished(self, func, queue_name=None):
        """
        判断某个任务函数是否已经执行完成
        :param func: 任务函数对象
        :param queue_name: 队列名称，不传则使用默认队列
        :return: True/False
        """
        queue = self.get_queue(queue_name)
        finished_registry = FinishedJobRegistry(queue.name, self.redis_conn)
        # 获取所有已完成的 Job
        finished_jobs = finished_registry.get_job_ids()
        for job_id in finished_jobs:
            job = Job.fetch(job_id, connection=self.redis_conn)
            if job.func_name == f"{func.__module__}.{func.__name__}":
                return True
        return False

    def get_queue(self, name=None):
        """
        获取队列，如果不存在则创建
        """
        if not name:
            name = self.default_queue
        if name not in self.queues:
            self.queues[name] = Queue(name=name, connection=self.redis_conn)
        return self.queues[name]

    def enqueue(self, func, *args, queue_name=None, **kwargs):
        """
        向队列提交任务
        :param func: 任务函数
        :param args: 位置参数
        :param queue_name: 队列名称（不传则用默认队列）
        :param kwargs: 关键字参数
        :return: Job 对象
        """
        queue = self.get_queue(queue_name)
        job = queue.enqueue(func, *args, **kwargs)
        return job

    def get_job(self, job_id):
        """
        获取任务对象
        """
        return Job.fetch(job_id, connection=self.redis_conn)

    def get_job_status(self, job_id):
        """
        获取任务状态
        """
        job = self.get_job(job_id)
        return job.get_status()

    def get_job_result(self, job_id):
        """
        获取任务结果
        """
        job = self.get_job(job_id)
        return job.result

    def list_jobs(self, queue_name=None):
        """
        列出队列中的任务
        """
        queue = self.get_queue(queue_name)
        return {
            "queued": [job.id for job in queue.jobs],
            "started": [job.id for job in StartedJobRegistry(queue.name, self.redis_conn).get_job_ids()],
            "finished": [job.id for job in FinishedJobRegistry(queue.name, self.redis_conn).get_job_ids()],
            "failed": [job.id for job in FailedJobRegistry(queue.name, self.redis_conn).get_job_ids()],
        }
