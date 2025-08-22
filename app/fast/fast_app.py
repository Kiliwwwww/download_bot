from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.fast.router.api import api_router
from app.fast.router.admin import admin_router
from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import logger
from fastapi.middleware.cors import CORSMiddleware  # 解决跨域问题

from app.utils.yaml_config import config

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
server_app.include_router(api_router)
server_app.include_router(admin_router)
dest_dir = config.get("save.dest_dir")
# 映射zip包的路径
server_app.mount(f"/{dest_dir}", StaticFiles(directory=f"{dest_dir}"), name=f"{dest_dir}")
# 映射静态文件
server_app.mount("/public", StaticFiles(directory="public"), name="public")

@server_app.get("/")
async def root():
    return {"message": "jinman_pull_server"}



