import os
from app.utils.logger_utils import FileLogger, logger


class AppInitializer:
    """
    应用初始化工具类
    用于启动前做一些目录创建、配置检查等操作
    """

    def __init__(self, base_dir=".", logger: FileLogger = None):
        self.base_dir = base_dir
        self.logger = logger

    def ensure_dir(self, dir_name: str):
        """
        确保目录存在，如果不存在就创建
        """
        path = os.path.join(self.base_dir, dir_name)
        os.makedirs(path, exist_ok=True)
        if self.logger:
            self.logger.info(f"确认目录存在: {path}")
        return path

    def check_config_files(self):
        """
        检查 config 目录下的配置文件是否存在
        """
        config_dir = os.path.join(self.base_dir, "config")
        required_files = ["config.yml", "jm_downloader.yml"]

        missing_files = []
        for file in required_files:
            file_path = os.path.join(config_dir, file)
            if not os.path.exists(file_path):
                missing_files.append(file)
                if self.logger:
                    self.logger.error(f"缺少配置文件: {file_path}")

        if missing_files:
            raise FileNotFoundError(
                f"缺少必要的配置文件: {', '.join(missing_files)}, 请在配置文件夹config目录下根据example文件进行创建对应的配置文件。"
            )
        else:
            if self.logger:
                self.logger.info("所有配置文件检查通过")

    def initialize(self):
        """
        执行所有初始化操作
        """
        log = """
           /$$$$$$                                                                                        /$$                   /$$    
          |_  $$_/                                                                                       | $$                  | $$    
       /$$  | $$   /$$$$$$$  /$$$$$$/$$$$   /$$$$$$  /$$$$$$$          /$$$$$$  /$$   /$$ /$$   /$$      | $$$$$$$   /$$$$$$  /$$$$$$  
      |__/  | $$  | $$__  $$| $$_  $$_  $$ |____  $$| $$__  $$        /$$__  $$| $$  | $$| $$  | $$      | $$__  $$ /$$__  $$|_  $$_/  
       /$$  | $$  | $$  \ $$| $$ \ $$ \ $$  /$$$$$$$| $$  \ $$       | $$  \ $$| $$  | $$| $$  | $$      | $$  \ $$| $$  \ $$  | $$    
      | $$  | $$  | $$  | $$| $$ | $$ | $$ /$$__  $$| $$  | $$       | $$  | $$| $$  | $$| $$  | $$      | $$  | $$| $$  | $$  | $$ /$$
      | $$ /$$$$$$| $$  | $$| $$ | $$ | $$|  $$$$$$$| $$  | $$       | $$$$$$$/|  $$$$$$/|  $$$$$$/      | $$$$$$$/|  $$$$$$/  |  $$$$/
      | $$|______/|__/  |__/|__/ |__/ |__/ \_______/|__/  |__//$$$$$$| $$____/  \______/  \______//$$$$$$|_______/  \______/    \___/  
 /$$  | $$                                                   |______/| $$                        |______/                              
|  $$$$$$/                                                           | $$                                                              
 \______/                                                            |__/                                                                                                                        |__/                                                              
        """
        logger.info(log)
        # 确保 books 目录存在
        self.ensure_dir("books")

        # 检查配置文件
        self.check_config_files()

        if self.logger:
            self.logger.info("应用初始化完成")
