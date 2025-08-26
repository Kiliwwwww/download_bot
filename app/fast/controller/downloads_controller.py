from fastapi import APIRouter
from app.fast.service.download_service import clear_cache
from app.fast.service.start_job_service import start_download
from app.utils.logger_utils import logger

from app.utils.standard_responese import StandardResponse

downloads_router = APIRouter(prefix="/downloads", tags=["downloads"])


@downloads_router.get("/", response_model=StandardResponse[dict])
def read_root():
    return StandardResponse(
        data={"message": "Hello, FastAPI"}
    )


# 修改成异步任务 常用测试id = 422866
@downloads_router.post("/{jm_comic_id}", response_model=StandardResponse[dict])
def read_item(jm_comic_id: int):
    try:
        task = start_download(jm_comic_id)
        return StandardResponse(
            data={"task_id": task.id}
        )
    except Exception as e:
        logger.error(f"创建任务失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"创建任务失败: {str(e)}"
        )


@downloads_router.get("/clear", response_model=StandardResponse[dict])
def clear():
    try:
        clear_cache()
        return StandardResponse(
            data={"status": "ok"}
        )
    except Exception as e:
        logger.error(f"清除缓存失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"清除缓存失败: {str(e)}"
        )
