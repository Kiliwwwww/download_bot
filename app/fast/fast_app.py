from fastapi import FastAPI

from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import FileLogger
logger = FileLogger(name="logger")

server_app = FastAPI()
# 创建初始化工具实例
initializer = AppInitializer(base_dir=".")


@server_app.on_event("startup")
async def startup_event():
    initializer.initialize()


@server_app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@server_app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
