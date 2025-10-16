from fastapi import *
from pydantic import BaseModel
import zipstream
from app.fast.service.jm_service import get_item
from app.fast.service.start_job_service import start_download, retry_download
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse
from app.utils.yaml_config import config, jm_downloader
import urllib.parse
from fastapi.responses import StreamingResponse
import io
import os
import time
import zipfile
import urllib.parse
import zipstream
from fastapi import Query
from fastapi.responses import StreamingResponse
downloads_router = APIRouter(prefix="/downloads", tags=["downloads"])

BASE_DIR = jm_downloader.get("dir_rule.base_dir")


@downloads_router.get("/download_zip")
async def download_zip(folders: str = Query(...)):
    folders = folders.split(",")

    # 初始化最终打包的 zipstream（大压缩包）
    z = zipstream.ZipFile(mode="w", compression=zipstream.ZIP_DEFLATED, allowZip64=True)

    for folder in folders:
        data = get_item(int(folder))
        folder_name = data['name']  # 用新的文件夹名字
        folder_path = os.path.join(BASE_DIR, str(folder))
        if not os.path.exists(folder_path):
            continue

        # ==== 先生成单个文件夹的临时 zip 内容 ====
        temp_buffer = io.BytesIO()
        with zipfile.ZipFile(temp_buffer, "w", zipfile.ZIP_DEFLATED) as sub_zip:
            for root, _, files in os.walk(folder_path):
                for file in files:
                    abs_file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(abs_file_path, folder_path)
                    sub_zip.write(abs_file_path, rel_path)

        temp_buffer.seek(0)  # 回到开头读取内容

        # ==== 把这个小 zip 文件添加到总 zip 中 ====
        inner_zip_name = f"{folder_name}.zip"
        z.write_iter(inner_zip_name, temp_buffer)

    # ==== 返回 StreamingResponse ====
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
