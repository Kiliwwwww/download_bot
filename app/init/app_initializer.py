import os
import sqlite3

from app.utils.logger_utils import FileLogger, logger
from app.utils.yaml_config import config
from db.migration_checker import MigrationChecker





class AppInitializer:
    """
    应用初始化工具类
    用于启动前做一些目录创建、配置检查等操作
    """

    def __init__(self, base_dir=".", logger: FileLogger = None):
        self.base_dir = base_dir
        self.logger = logger



    def ensure_sqlite_db(self, str_path: str):
        """
        检查项目根目录下 db_path 是否存在，不存在则创建 SQLite 数据库文件
        :param db_path: 数据库文件名，默认 'app.sqlite'
        """
        # 获取绝对路径（项目根目录）
        db_path = os.path.abspath(str_path)
        logger.info(f"SQLite db path: {db_path}")
        if not os.path.exists(db_path):
            # 连接时，如果文件不存在，sqlite3 会自动创建
            conn = sqlite3.connect(db_path)
            conn.close()
            logger.info(f"✅ 数据库文件已创建: {db_path}")
        else:
            logger.info(f"✅ 数据库文件已存在: {db_path}")

    def ensure_dir(self, dir_name: str):
        """
        确保目录存在，如果不存在就创建
        """
        path = os.path.join(self.base_dir, dir_name)
        os.makedirs(path, exist_ok=True)
        if self.logger:
            self.logger.info(f"✅ 确认目录存在: {path}")
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
                    self.logger.error(f"❌ 缺少配置文件: {file_path}")

        if missing_files:
            raise FileNotFoundError(
                f"❌ 缺少必要的配置文件: {', '.join(missing_files)}, 请在配置文件夹config目录下根据example文件进行创建对应的配置文件。"
            )
        else:
            if self.logger:
                self.logger.info("✅ 所有配置文件检查通过")

    def initialize(self):
        """
        执行所有初始化操作
        """

        # 确保 books 目录存在
        self.ensure_dir("books")

        # 检查配置文件
        self.check_config_files()
        self.ensure_sqlite_db(config.get("database.sqlite.database"))
        checker = MigrationChecker()
        if checker.has_pending():
            checker.print_pending()  # 输出未执行的迁移
            checker.close()
            raise "❌ 迁移任务未完成"
        else:
            logger.info("✅ 迁移任务执行完成")

        if self.logger:
            self.logger.info("✅ 应用初始化完成")
