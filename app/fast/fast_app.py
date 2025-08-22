from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.fast.controllers.downloads_controller import router as downloads_router
from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import logger
from fastapi.middleware.cors import CORSMiddleware  # 解决跨域问题

initializer = AppInitializer(base_dir=".", logger=logger)
initializer.initialize()  # 直接在模块加载时执行

server_app = FastAPI()
server_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境用 *（允许所有域名），生产环境替换为前端实际域名（如 "https://your-frontend.com"）
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法（GET/POST/PUT 等）
    allow_headers=["*"],  # 允许所有请求头
)
server_app.include_router(downloads_router)

# 映射静态文件
server_app.mount("/zip", StaticFiles(directory="zip"), name="zip")
@server_app.get("/")
async def root():
    return {"message": "jinman_pull_server"}



