from jmcomic import JmSearchPage

from app.utils.jm_downloader import SearchHelper
helper = SearchHelper()


def jm_list(page: int=1, type: str="last" ):
    # 方法映射表
    type_map = {
        "last": helper.last_list,
        "view": helper.view_list,
        "like": helper.view_list,  # 注意这里和 view 一样
        "picture": helper.picture_list,
    }

    # 根据 type 获取方法，默认用 last_list
    fetch_func = type_map.get(type, helper.last_list)
    items: JmSearchPage = fetch_func(page=page)
    return items
