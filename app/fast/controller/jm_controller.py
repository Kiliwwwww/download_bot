import os
import shutil
import tempfile

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pathlib import Path

from fastapi.responses import FileResponse

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

@jm_router.get("/download_file/{filename}")
def download_file(filename: str, background_tasks: BackgroundTasks):
    original_file_path = os.path.join(DIR_STR, filename)
    if not os.path.isfile(original_file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    name, ext = os.path.splitext(filename)
    old_filename = name
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_file_path = temp_file.name
    temp_file.close()  # 关闭文件，后面用 shutil.copyfile 来写内容
    try:
        data = get_item(int(name))
        name = data["name"]
    except Exception as e:
        logger.error("获取文件名称失败")
        name = old_filename


    # 复制原文件内容到临时文件
    shutil.copyfile(original_file_path, temp_file_path)

    # 返回临时文件给前端，并设置下载文件名
    response = FileResponse(temp_file_path, filename=f"#{old_filename} - {name}{ext}", media_type='application/octet-stream')
    # 使用 BackgroundTasks 在响应完成后删除临时文件
    background_tasks.add_task(remove_file, temp_file_path)
    return response

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)

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
def keyword(name: str, page=1, type:str ='keyword'):
    try:
        logger.info(f"page={page} type={type}")
        items = search(name=name, page=page,type=type)
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
