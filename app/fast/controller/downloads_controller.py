from fastapi import *
from pydantic import BaseModel
import zipstream
from app.fast.service.jm_service import get_item
from app.fast.service.start_job_service import start_download, retry_download
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse
from app.utils.yaml_config import config, jm_downloader
import os
import time
import urllib.parse
from fastapi.responses import StreamingResponse

downloads_router = APIRouter(prefix="/downloads", tags=["downloads"])

BASE_DIR = config.get("save.dest_dir")


@downloads_router.get("/download_zip")
async def download_zip(folders: str = Query(...)):
    folders = folders.split(",")

    z = zipstream.ZipFile(mode="w", compression=zipstream.ZIP_DEFLATED, allowZip64=True)

    for folder in folders:
        data = get_item(int(folder))
        new_folder_name = data['name']  # 用新的文件名（不包含.zip）

        # 获取对应的小 zip 路径
        folder_zip_path = os.path.join(BASE_DIR, f"{folder}.zip")

        # 设置在总 zip 中的名称，例如 “课程A.zip”
        arcname = f"{new_folder_name}.zip"

        # 写入整个小 zip 文件
        z.write(folder_zip_path, arcname)

    # 构造返回的总 zip 文件名
    raw_filename = f"下载bot酱批量下载喵_{int(time.time())}.zip"
    quoted_filename = urllib.parse.quote(raw_filename)

    return StreamingResponse(
        z,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quoted_filename}"},
    )


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
