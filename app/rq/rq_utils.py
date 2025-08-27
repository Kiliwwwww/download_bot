from rq import Queue
from redis import Redis
from rq.job import Job

from app.utils.yaml_config import config


class RQManager:
    def __init__(self):
        redis_url = config.get("server.redis")
        """
        初始化 RQManager
        :param redis_url: Redis 连接 URL
        """
        self.redis_conn = Redis.from_url(redis_url)
        self.queues = {}

    def get_queue(self, name="default"):
        """
        获取队列，如果不存在则创建
        """
        if name not in self.queues:
            self.queues[name] = Queue(name=name, connection=self.redis_conn)
        return self.queues[name]

    def enqueue(self, func, *args, queue_name="default", **kwargs):
        """
        向队列提交任务
        :param func: 任务函数
        :param args: 位置参数
        :param queue_name: 队列名称
        :param kwargs: 关键字参数
        :return: Job 对象
        """
        queue = self.get_queue(queue_name)
        job = queue.enqueue(func, *args, **kwargs)
        return job

    def get_job(self, job_id, queue_name="default"):
        """
        获取任务对象
        """
        queue = self.get_queue(queue_name)
        return Job.fetch(job_id, connection=self.redis_conn)

    def get_job_status(self, job_id, queue_name="default"):
        """
        获取任务状态
        """
        job = self.get_job(job_id, queue_name)
        return job.get_status()

    def get_job_result(self, job_id, queue_name="default"):
        """
        获取任务结果
        """
        job = self.get_job(job_id, queue_name)
        return job.result
