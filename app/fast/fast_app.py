from fastapi import FastAPI
from app.fast.controllers.downloads_controller import router as downloads_router
from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import FileLogger
logger = FileLogger(name="logger")

server_app = FastAPI()
# 创建初始化工具实例
initializer = AppInitializer(base_dir=".", logger=logger)
server_app.include_router(downloads_router)


@server_app.on_event("startup")
async def startup_event():
    initializer.initialize()


