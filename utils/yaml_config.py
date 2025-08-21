import yaml
import os

CONFIG_FILE = 'config/config.yml'
JM_CONFIG_FILE = 'config/jm_downloader.yml'


class YamlConfig:
    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"YAML 文件不存在: {file_path}")
        self.file_path = file_path
        self._config = self._load_yaml()

    def _load_yaml(self):
        """加载 yml 文件"""
        with open(self.file_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def get(self, key: str, default=None):
        """根据 key 获取配置，支持 'a.b.c' 形式的嵌套访问"""
        keys = key.split(".")
        value = self._config
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default

    def reload(self):
        """重新加载配置文件"""
        self._config = self._load_yaml()

    @property
    def data(self):
        """返回整个配置字典"""
        return self._config
