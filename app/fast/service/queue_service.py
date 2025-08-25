
from app.utils.logger_utils import logger
from app.utils.paginator import Paginator
from app.celery.task_manager import TaskManager





def queue_active_list(page=1, per_page=20, sort_key=None, reverse=True):
    """
    获取正在执行中的任务列表（支持排序 + 分页）
    :param page: 当前页码
    :param per_page: 每页数量
    :param sort_key: 排序字段
    :param reverse: 是否倒序
    :return: dict {total, page, per_page, items}
    """
    arr = TaskManager.active_tasks()

    logger.info(f"arr={arr}")
    # 排序
    arr = Paginator.sort(arr, sort_key, reverse)
    paginator = Paginator(arr, page, per_page)
    return paginator.get_page()


def queue_list(page=1, per_page=20, sort_key="date_done", reverse=True):
    """
    获取任务队列列表（支持排序 + 分页）
    :param page: 当前页码，从 1 开始
    :param per_page: 每页数量
    :param sort_key: 排序字段（任务 JSON 中的字段）
    :param reverse: 是否倒序（默认 True = 新任务在前）
    :return: dict {total: 总数, page: 当前页, per_page: 每页数量, items: 列表}
    """
    arr = TaskManager.completed_tasks()


    arr = Paginator.sort(arr, sort_key, reverse)
    paginator = Paginator(arr, page, per_page)
    return paginator.get_page()
