import logging
from logging.handlers import RotatingFileHandler
import os


class FileLogger:
    """
    文件+控制台日志工具类，日志格式：[时间戳]: 日志内容
    支持日志滚动，避免日志文件过大
    from utils.logger_utils import FileLogger

    logger = FileLogger(name="MyAppLogger")

    logger.info("应用启动成功")
    logger.warning("磁盘空间不足")
    logger.error("发生未知异常")
    """

    def __init__(self, name: str = "AppLogger", log_dir: str = "logs", max_bytes: int = 5 * 1024 * 1024, backup_count: int = 3):
        """
        name: 日志器名称
        log_dir: 日志文件目录
        max_bytes: 单个日志文件最大字节
        backup_count: 保留的日志文件数量
        """
        self.name = name
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)
        self.log_file = os.path.join(self.log_dir, f"{self.name}.log")

        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.DEBUG)  # 输出所有级别日志
        self.logger.propagate = False  # 防止重复打印

        # 日志格式
        formatter = logging.Formatter('[%(asctime)s]: [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

        # 控制台输出
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

        # 文件输出 + 日志滚动
        file_handler = RotatingFileHandler(self.log_file, maxBytes=max_bytes, backupCount=backup_count, encoding='utf-8')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    def info(self, message: str):
        self.logger.info(message)

    def warning(self, message: str):
        self.logger.warning(message)

    def error(self, message: str):
        self.logger.error(message)


logger = FileLogger(name="logger")