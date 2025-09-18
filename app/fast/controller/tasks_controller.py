
from fastapi import APIRouter, Request, Query
from app.fast.service.queue_service import queue_list
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse

tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])

@tasks_router.get("/queue", response_model=StandardResponse[dict])
def queue(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100),
          start_time:str = None, end_time:str = None, keyword:str = None):
    try:
        logger.info(f"page={page}, per_page={per_page}")
        params = {"page": page, "per_page": per_page, "start_time": start_time, "end_time": end_time, "keyword": keyword}
        data = queue_list(params)


        return StandardResponse(
            data=data
        )
    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )




