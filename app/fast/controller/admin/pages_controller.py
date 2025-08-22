from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import APIRouter, Request

pages_router = APIRouter(prefix="/pages", tags=["pages"])
templates = Jinja2Templates(directory="templates")


@pages_router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})