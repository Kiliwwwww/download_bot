from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.fast.controllers.downloads_controller import router as downloads_router
from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import logger

initializer = AppInitializer(base_dir=".", logger=logger)
initializer.initialize()  # 直接在模块加载时执行

server_app = FastAPI()

server_app.include_router(downloads_router)

# 映射静态文件
server_app.mount("/zip", StaticFiles(directory="zip"), name="zip")
@server_app.get("/")
async def root():
    return {"message": "jinman_pull_server"}



