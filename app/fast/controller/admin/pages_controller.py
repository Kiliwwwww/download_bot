from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import APIRouter, Request
from jinja2 import Environment, FileSystemLoader

pages_router = APIRouter(prefix="/pages", tags=["pages"])
# 自定义 Jinja2 环境
jinja_env = Environment(
    loader=FileSystemLoader("templates"),
    block_start_string="(%", block_end_string="%)",
    variable_start_string="[[", variable_end_string="]]",   # 改成 [[ ]]
    comment_start_string="(#", comment_end_string="#)"
)
templates = Jinja2Templates(directory="templates")
templates.env = jinja_env  # 替换掉默认的 env

@pages_router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})