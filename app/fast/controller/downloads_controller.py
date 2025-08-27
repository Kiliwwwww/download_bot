from fastapi import APIRouter
from pydantic import BaseModel

from app.fast.service.download_service import clear_cache
from app.fast.service.start_job_service import start_download, retry_download
from app.utils.logger_utils import logger

from app.utils.standard_responese import StandardResponse

downloads_router = APIRouter(prefix="/downloads", tags=["downloads"])


@downloads_router.get("/", response_model=StandardResponse[dict])
def read_root():
    return StandardResponse(
        data={"message": "Hello, FastAPI"}
    )

class Item(BaseModel):
    jm_comic_ids: list

class RetryItem(BaseModel):
    task_ids: list[str]

# 修改成异步任务 常用测试id = 422866
@downloads_router.post("/", response_model=StandardResponse[dict])
def read_item(items: Item):
    try:
        task_ids = []
        for item in items.jm_comic_ids:
            jm_comic_id = int(item)
            task = start_download(jm_comic_id)
            task_ids.append(task)
        return StandardResponse(
            data={"task_ids": task_ids}
        )
    except Exception as e:
        logger.error(f"创建任务失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"创建任务失败: {str(e)}"
        )


# 重试下载
@downloads_router.post("/retry", response_model=StandardResponse[dict])
def retry(items: RetryItem):
    try:
        task_ids = []
        for item in items.task_ids:
            logger.info(item)
            retry_download(item)
            task_ids.append(item)
        return StandardResponse(
            data={"task_ids": task_ids}
        )
    except Exception as e:
        logger.info(f"创建任务失败: {str(e)}")
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
