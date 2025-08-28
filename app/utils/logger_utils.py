import logging

class FileLogger:
    """
    只打印到控制台的日志工具类，日志格式：[时间戳]: 日志内容
    使用示例：
        logger = ConsoleLogger(name="MyAppLogger")
        logger.info("应用启动成功")
        logger.warning("磁盘空间不足")
        logger.error("发生未知异常")
    """

    def __init__(self, name: str = "AppLogger"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)  # 输出所有级别日志
        self.logger.propagate = False  # 防止重复打印

        # 日志格式
        formatter = logging.Formatter('[%(asctime)s]: [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

        # 控制台输出
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def info(self, message: str):
        self.logger.info(message)

    def warning(self, message: str):
        self.logger.warning(message)

    def error(self, message: str):
        self.logger.error(message)


logger = FileLogger(name="logger")
