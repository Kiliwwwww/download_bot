import json

from jmcomic import JmSearchPage

from app.utils import *
from app.utils.jm_downloader import SearchHelper
from app.utils.redis_utils import RedisUtils, JM_CACHE_KEY

helper = SearchHelper()
redis_utils = RedisUtils()


def search(name:str, page=1, type:str ='keyword'):
    if type == 'keyword':
        return helper.keyword_search(name=name, page=page)
    elif type == 'tag':
        return helper.tag_search(tag=name, page=page)
    elif type == 'author':
        return helper.author_search(author=name, page=page)
    elif type == 'actor':
        return helper.actor_search(actor=name, page=page)
    return []


def get_item(jm_id: int):
    cache_key = f"{JM_CACHE_KEY}{jm_id}"

    # 1. 先查缓存
    cached_data = redis_utils.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    # 2. 没缓存就查 helper
    item = helper.get(jm_id)
    data = {
        "jm_id": item.album_id,
        "scramble_id": item.scramble_id,
        "name": item.name,
        "page_count": item.page_count,
        "pub_date": item.pub_date,
        "update_date": item.update_date,
        "likes": item.likes,
        "views": item.views,
        "comment_count": item.comment_count,
        "works": item.works,
        "actors": item.actors,
        "authors": item.authors,
        "tags": item.tags,
        "related_list": item.related_list,
        "description": item.description,
        "img_url": f'https://cdn-msp2.18comic.vip/media/albums/{item.album_id}.jpg?u=1756608084'
    }

    # 3. 写入缓存，有效期 1 天
    redis_utils.set(cache_key, json.dumps(data), ex=86400)

    return data


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
