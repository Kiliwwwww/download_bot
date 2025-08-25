from typing import List, Any

from fastapi import APIRouter, Request, Query
from app.fast.service.queue_service import queue_list, queue_active_list
from app.utils.logger_utils import logger
from app.celery.celery_worker import celery_app
from celery.result import AsyncResult

from app.utils.standard_responese import StandardResponse

tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])
@tasks_router.get("/queue_active", response_model=StandardResponse[dict])
def queue_active(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100)):
    try:
        logger.info(f"page={page}, per_page={per_page}")
        data = queue_active_list(page, per_page)
        return StandardResponse(
            data=data
        )
    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )

@tasks_router.get("/queue", response_model=StandardResponse[dict])
def queue(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100)):
    try:
        logger.info(f"page={page}, per_page={per_page}")
        data = queue_list(page,per_page)
        return StandardResponse(
            data=data
        )
    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )




@tasks_router.get("/{task_id}", response_model=StandardResponse[dict])
async def get_result(task_id: str, request: Request):
    try:
        base_url = str(request.base_url)
        task_result = AsyncResult(task_id, app=celery_app)

        if task_result.ready():
            if task_result.failed():
                # 任务执行失败
                return StandardResponse(
                    code=500,
                    message=f"任务执行失败: {str(task_result.result)}"
                )

            # 任务执行成功
            return StandardResponse(
                data={
                    "status": "done",
                    "result": f"{base_url}{task_result.result['url']}"
                }
            )

        # 任务仍在处理中
        return StandardResponse(
            data={"status": "pending"}
        )
    except Exception as e:
        logger.error(f"获取任务结果失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取任务结果失败: {str(e)}"
        )
