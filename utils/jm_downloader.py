import jmcomic
from jmcomic import download_album

from utils.yaml_config import YamlConfig
from utils.zip_utils import ZipUtils


def download_and_zip(jm_id: int, config_path: str = 'jm_downloader.yml') -> str:
    """
    根据 jm_id 下载本子并打包为 zip 文件

    :param jm_id: 本子 ID
    :param config_path: 配置文件路径，默认 'config.yml'
    :return: 压缩包路径
    """
    # 创建配置对象
    option = jmcomic.create_option_by_file(config_path)

    # 默认配置
    config = YamlConfig("config.yml")
    # jm下载配置
    jm_downloader = YamlConfig("jm_downloader.yml")
    # 使用 option 对象来下载本子
    download_album(jm_id, option)

    # 压缩下载的文件夹
    folder_to_zip = f'{jm_downloader.get("dir_rule.base_dir")}/{jm_id}'
    output_zip = ZipUtils.zip_folder(folder_to_zip, config.get("save.dest_dir"), f"{jm_id}.zip")

    return output_zip
