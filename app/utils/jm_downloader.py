import jmcomic
from jmcomic import download_album, JmOption, JmCategoryPage, JmMagicConstants
from app.utils.logger_utils import logger
from app.utils.yaml_config import config, jm_downloader, JM_CONFIG_FILE
from app.utils.zip_utils import ZipUtils
from app.utils.redis_utils import RedisUtils, JM_KEY

# 全局变量初始化
redis_util = RedisUtils()
option = jmcomic.create_option_by_file(JM_CONFIG_FILE)
client = option.new_jm_client()  # 先声明，后续初始化


# 获取搜索列表
def list_for_type(page, time, category, order_by):
    return client.categories_filter(
        page=page,
        time=time,
        category=category,
        order_by=order_by,
    )


def download_and_zip(jm_id: int) -> str:
    """
    根据 jm_id 下载本子并打包为 zip 文件

    :param jm_id: 本子 ID
    :return: 压缩包路径
    """

    # 使用 option 对象来下载本子
    data1 = download_album(jm_id, option)
    logger.info(f"下载完真正的jm_id：{data1[0].id}")
    if jm_id != data1[0].id:
        redis_util.hset(JM_KEY, f"{jm_id}", data1[0].id)
    jm_id = data1[0].id
    # 压缩下载的文件夹
    folder_to_zip = f'{jm_downloader.get("dir_rule.base_dir")}/{jm_id}'
    dest_dir = config.get('save.dest_dir')
    output_zip = ZipUtils.zip_folder(folder_to_zip, dest_dir, f"{jm_id}.zip")
    logger.info(output_zip)
    return f"{dest_dir}/{jm_id}.zip"


class SearchHelper:
    def __init__(self):
        return

    def search(self, page, time, category, order_by):
        return list_for_type(page, time, category, order_by)

    def last_list(self, page):
        return list_for_type(page, JmMagicConstants.TIME_ALL,
                             JmMagicConstants.CATEGORY_ALL, JmMagicConstants.ORDER_BY_LATEST)

    # 游览量最高
    def view_list(self, page):
        return list_for_type(page, JmMagicConstants.TIME_ALL,
                             JmMagicConstants.CATEGORY_ALL, JmMagicConstants.ORDER_BY_VIEW)

    # 点赞数最高
    def like_list(self, page):
        return list_for_type(page, JmMagicConstants.TIME_ALL,
                             JmMagicConstants.CATEGORY_ALL, JmMagicConstants.ORDER_BY_LIKE)

    # 页数最多
    def picture_list(self, page):
        return list_for_type(page, JmMagicConstants.TIME_ALL,
                             JmMagicConstants.CATEGORY_ALL, JmMagicConstants.ORDER_BY_PICTURE)