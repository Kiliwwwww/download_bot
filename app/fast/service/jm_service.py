from jmcomic import JmSearchPage

from app.utils.jm_downloader import SearchHelper
from app.utils.logger_utils import logger

helper = SearchHelper()

def get_item(jm_id: int):
    item = helper.get(jm_id)
    return {
        "jm_id":item.album_id,
        "scramble_id":item.scramble_id,
        "name":item.name,
        "page_count":item.page_count,
        "pub_date":item.pub_date,
        "update_date":item.update_date,
        "likes":item.likes,
        "views":item.views,
        "comment_count":item.comment_count,
        "works":item.works,
        "actors":item.actors,
        "authors":item.authors,
        "tags":item.tags,
        "related_list":item.related_list,
        "description":item.description,
        "img_url": f'https://cdn-msp2.18comic.vip/media/albums/{item.album_id}.jpg?u=1756608084'
    }


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
