import os
import shutil
import tempfile

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pathlib import Path

from fastapi.responses import FileResponse
from starlette.responses import StreamingResponse

from app.fast.service.jm_service import jm_list, get_item, search
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse
from app.utils.yaml_config import config

jm_router = APIRouter(prefix="/jm", tags=["jm"])


def build_response(items,page):
    if not items:
        return {
            "total": 0,
            "page": page,
            "per_page": 0,
            "items": []
        }
    arr = [{"jm_id": album_id, "title": title} for album_id, title in items]
    return {
        "total": items.total,
        "page": page,
        "per_page": len(arr),
        "items": arr
    }

BASE_DIR = Path(__file__).resolve().parents[3]
FILES_DIR = config.get("save.dest_dir")
DIR_STR = str(BASE_DIR / FILES_DIR)

from urllib.parse import quote

@jm_router.get("/download_file/{filename}")
def download_file(filename: str):
    original_file_path = os.path.join(DIR_STR, filename)
    if not os.path.isfile(original_file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    name, ext = os.path.splitext(filename)
    old_filename = name
    try:
        data = get_item(int(name))
        name = data["name"]
    except Exception:
        logger.error("获取文件名称失败")
        name = old_filename

    def iterfile(path: str):
        with open(path, "rb") as f:
            while chunk := f.read(1024 * 1024):  # 1MB 分块
                yield chunk

    # 中文文件名需要 URL encode
    download_name = f"#{old_filename} - {name}{ext}"
    quoted_name = quote(download_name)  # URL encode 中文

    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{quoted_name}"
    }

    return StreamingResponse(
        iterfile(original_file_path),
        media_type="application/octet-stream",
        headers=headers
    )



@jm_router.get("/get/{jm_id}", response_model=StandardResponse[dict])
def get(jm_id: int):
    try:
        data = get_item(jm_id)
        return StandardResponse(data=data)
    except Exception as e:
        logger.error(f"获取信息失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取信息失败: {str(e)}"
        )

@jm_router.get("/search", response_model=StandardResponse[dict])
def keyword(name: str, page=1, search_type:str ='keyword'):
    try:
        logger.info(f"page={page} type={search_type}")
        items = search(name=name, page=page,search_type=search_type)
        logger.info(f"items={items}")
        # 构造返回数据的函数
        return StandardResponse(data=build_response(items, page))

    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )

@jm_router.get("/list", response_model=StandardResponse[dict])
def last_list(page: int = 1, type: str = "last"):
    try:
        logger.info(f"page={page} type={type}")
        items = jm_list(type=type, page=page)
        # 构造返回数据的函数
        return StandardResponse(data=build_response(items, page))

    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )
