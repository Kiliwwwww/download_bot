from app.model.task_record import TaskRecord
from app.utils.logger_utils import logger
from app.utils.paginator import Paginator






def queue_list(page=1, per_page=20, sort_key="start_time", reverse=True):
    """
    获取任务队列列表（支持排序 + 分页）
    :param page: 当前页码，从 1 开始
    :param per_page: 每页数量
    :param sort_key: 排序字段（任务 JSON 中的字段）
    :param reverse: 是否倒序（默认 True = 新任务在前）
    :return: dict {total: 总数, page: 当前页, per_page: 每页数量, items: 列表}
    """
    arr = TaskRecord.objects().to_dict()


    arr = Paginator.sort(arr, sort_key, reverse)
    paginator = Paginator(arr, page, per_page)
    return paginator.get_page()
