import datetime

from app.model.job_item import JobItem, SYNC_FINISHED_COUNT
from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
from app.utils.paginator import Paginator
from app.rq.rq_utils import RQManager
from app.task.sync_file_size_task import sync_all_file_finished_count
rq_manager = RQManager()






def queue_list(page=1, per_page=20, sort_key="start_time", reverse=True):
    """
    获取任务队列列表（支持排序 + 分页）
    :param page: 当前页码，从 1 开始
    :param per_page: 每页数量
    :param sort_key: 排序字段（任务 JSON 中的字段）
    :param reverse: 是否倒序（默认 True = 新任务在前）
    :return: dict {total: 总数, page: 当前页, per_page: 每页数量, items: 列表}
    """
    try:
        job_item = JobItem.objects().where(task_type=SYNC_FINISHED_COUNT, status="RUNNING").to_dict()
        if not job_item:
            rq = rq_manager.enqueue(sync_all_file_finished_count,queue_name="default")
            task_id = str(rq.id)
            JobItem.create_record(task_id=rq.id,
                                  task_type=SYNC_FINISHED_COUNT,
                                  status="RUNNING",
                                  created_at=datetime.datetime.now(),
                                  updated_at=datetime.datetime.now(),
                                  user_id=1)
            logger.info(f"同步下载文件异步任务启动: task_id{task_id}")
        else:
            logger.info("同步脚本进行中...")
    except Exception as e:
        logger.error(str(e))



    arr = TaskRecord.objects().to_dict()


    arr = Paginator.sort(arr, sort_key, reverse)
    paginator = Paginator(arr, page, per_page)
    return paginator.get_page()
