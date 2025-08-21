import jmcomic
from jmcomic import download_album
from app.utils.logger_utils import logger
from app.utils.yaml_config import YamlConfig, CONFIG_FILE, JM_CONFIG_FILE
from app.utils.zip_utils import ZipUtils


def download_and_zip(jm_id: int, config_path: str = JM_CONFIG_FILE) -> str:
    """
    根据 jm_id 下载本子并打包为 zip 文件

    :param jm_id: 本子 ID
    :param config_path: 配置文件路径，默认 'config.yml'
    :return: 压缩包路径
    """
    # 创建配置对象
    option = jmcomic.create_option_by_file(config_path)

    # 默认配置
    config = YamlConfig(CONFIG_FILE)
    # jm下载配置
    jm_downloader = YamlConfig(JM_CONFIG_FILE)
    # 使用 option 对象来下载本子
    download_album(jm_id, option)

    # 压缩下载的文件夹
    folder_to_zip = f'{jm_downloader.get("dir_rule.base_dir")}/{jm_id}'
    output_zip = ZipUtils.zip_folder(folder_to_zip, config.get("save.dest_dir"), f"{jm_id}.zip")
    logger.info(output_zip)
    return output_zip
