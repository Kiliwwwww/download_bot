import os


class AppInitializer:
    """
    应用初始化工具类
    用于启动前做一些目录创建、配置检查等操作
    """

    def __init__(self, base_dir="."):
        self.base_dir = base_dir

    def ensure_dir(self, dir_name: str):
        """
        确保目录存在，如果不存在就创建
        """
        path = os.path.join(self.base_dir, dir_name)
        os.makedirs(path, exist_ok=True)
        print(f"[Init] 确认目录存在: {path}")
        return path

    def initialize(self):
        """
        执行所有初始化操作
        """
        # 示例：确保 books 目录存在
        self.ensure_dir("books")

