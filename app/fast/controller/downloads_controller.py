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

BASE_DIR = jm_downloader.get("dir_rule.base_dir")


@downloads_router.get("/download_zip")
async def download_zip(folders: str = Query(...)):
    folders = folders.split(",")

    # 初始化 zipstream
    z = zipstream.ZipFile(mode="w", compression=zipstream.ZIP_DEFLATED, allowZip64=True)

    for folder in folders:
        data = get_item(int(folder))
        new_folder_name = data['name']   # 用新的文件夹名字
        folder_path = os.path.join(BASE_DIR, str(folder))
        if not os.path.exists(folder_path):
            continue

        for root, _, files in os.walk(folder_path):
            for file in files:
                abs_file_path = os.path.join(root, file)

                # 原始相对路径
                rel_path = os.path.relpath(abs_file_path, folder_path)

                # 拼接新的文件夹名字
                arcname = os.path.join(new_folder_name, rel_path)

                z.write(abs_file_path, arcname)

    # 返回 StreamingResponse
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
