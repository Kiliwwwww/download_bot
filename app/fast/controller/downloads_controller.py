import io
import os
import time
import uuid
import shutil
import zipfile
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Query, BackgroundTasks
from pydantic import BaseModel
from starlette.responses import FileResponse

from app.fast.service.jm_service import get_item
from app.fast.service.start_job_service import start_download, retry_download
from app.utils.logger_utils import logger

from app.utils.standard_responese import StandardResponse
from app.utils.yaml_config import config, jm_downloader

downloads_router = APIRouter(prefix="/downloads", tags=["downloads"])

BASE_DIR = jm_downloader.get("dir_rule.base_dir")


import io
import os
import time
import zipfile
import urllib.parse
from fastapi.responses import StreamingResponse

@downloads_router.get("/zip_download")
def download_folders(folder_names: str):
    folder_list = folder_names.split(",")

    def iterfile():
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for folder in folder_list:
                folder_path = os.path.join(BASE_DIR, folder)
                if os.path.isdir(folder_path):
                    try:
                        data = get_item(int(folder))
                        new_folder_name = data['name']
                    except Exception:
                        new_folder_name = folder

                    for root, dirs, files in os.walk(folder_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, BASE_DIR)
                            arcname = arcname.replace(folder, new_folder_name, 1)
                            zipf.write(file_path, arcname)

        zip_buffer.seek(0)
        while chunk := zip_buffer.read(1024 * 1024):
            yield chunk

    # 文件名
    raw_filename = f"下载bot酱批量下载喵_{int(time.time())}.zip"
    quoted_filename = urllib.parse.quote(raw_filename)

    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{quoted_filename}"
    }

    return StreamingResponse(
        iterfile(),
        media_type="application/zip",
        headers=headers
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
