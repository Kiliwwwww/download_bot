from fastapi import FastAPI
from app.fast.controllers.downloads_controller import router as downloads_router


server_app = FastAPI()

server_app.include_router(downloads_router)






