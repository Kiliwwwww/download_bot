
from fastapi import APIRouter, Request, Query
from app.fast.service.queue_service import queue_list
from app.rq.rq_utils import RQManager
from app.task.sync_file_size_task import sync_all_file_finished_count
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse

tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])
rq_manager = RQManager()

@tasks_router.get("/queue", response_model=StandardResponse[dict])
def queue(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100)):
    try:
        logger.info(f"page={page}, per_page={per_page}")
        data = queue_list(page,per_page)

        rq = rq_manager.enqueue(sync_all_file_finished_count)
        task_id = str(rq.id)
        logger.info(f"同步下载文件异步任务启动{task_id}")

        return StandardResponse(
            data=data
        )
    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )




