from fastapi import APIRouter
from jmcomic import JmSearchPage

from app.utils.jm_downloader import SearchHelper
from app.utils.logger_utils import logger
from app.utils.standard_responese import StandardResponse

helper = SearchHelper()
jm_router = APIRouter(prefix="/jm", tags=["jm"])


@jm_router.get("/list", response_model=StandardResponse[dict])
def last_list(page: int = 1, type: str = "last"):
    try:
        logger.info(f"page={page} type={type}")

        # 方法映射表
        type_map = {
            "last": helper.last_list,
            "view": helper.view_list,
            "like": helper.view_list,   # 注意这里和 view 一样
            "picture": helper.picture_list,
        }

        # 根据 type 获取方法，默认用 last_list
        fetch_func = type_map.get(type, helper.last_list)
        items: JmSearchPage = fetch_func(page=page)

        # 构造返回数据的函数
        def build_response(items: JmSearchPage | None):
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

        return StandardResponse(data=build_response(items))

    except Exception as e:
        logger.error(f"获取列表失败: {str(e)}")
        return StandardResponse(
            code=500,
            message=f"获取列表失败: {str(e)}"
        )
