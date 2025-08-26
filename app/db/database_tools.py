import sqlite3
import pymysql
from pymysql.cursors import DictCursor
from app.utils.yaml_config import config


class Database:
    def __init__(self):
        """初始化数据库连接，配置来自 config/config.yml"""
        self.db_type = config.get("database.type", "sqlite").lower()
        self.conn = None
        self.cursor = None

        if self.db_type == "sqlite":
            db_path = config.get("database.sqlite.database", ":memory:")
            self.conn = sqlite3.connect(db_path)
            # 让返回值是 dict，而不是 tuple
            self.conn.row_factory = self._dict_factory
            self.cursor = self.conn.cursor()
        elif self.db_type == "mysql":
            self.conn = pymysql.connect(
                host=config.get("database.mysql.host", "localhost"),
                user=config.get("database.mysql.user", "root"),
                password=config.get("database.mysql.password", ""),
                database=config.get("database.mysql.database", ""),
                port=config.get("database.mysql.port", 3306),
                charset="utf8mb4",
                cursorclass=DictCursor  # 直接返回字典
            )
            self.cursor = self.conn.cursor()
        else:
            raise ValueError("不支持的数据库类型，仅支持 sqlite 和 mysql")

    def _dict_factory(self, cursor, row):
        """sqlite3 返回字典格式"""
        return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

    def execute(self, sql, params=None):
        """执行增删改语句"""
        try:
            self.cursor.execute(sql, params or [])
            self.conn.commit()
            return True
        except Exception as e:
            print(f"执行失败: {e}")
            self.conn.rollback()
            return False

    def query(self, sql, params=None):
        """执行查询语句，返回所有结果（字典形式）"""
        try:
            self.cursor.execute(sql, params or [])
            return self.cursor.fetchall()
        except Exception as e:
            print(f"查询失败: {e}")
            return []

    def close(self):
        """关闭连接"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def __enter__(self):
        """支持 with 语法"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出时自动关闭连接"""
        self.close()
