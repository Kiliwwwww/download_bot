import os
import sqlite3

from app.utils.logger_utils import logger
from app.utils.yaml_config import config


class MigrationChecker:
    def __init__(self):
        """初始化数据库连接"""
        db_path = config.get("database.sqlite.database", "db/database.db")
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
        self._ensure_migrations_table()

    def _ensure_migrations_table(self):
        """确保有 schema_migrations 表"""
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY
            );
        """)
        self.conn.commit()

    def get_applied_migrations(self):
        """获取已经应用过的迁移版本"""
        self.cursor.execute("SELECT version FROM schema_migrations;")
        return {row[0] for row in self.cursor.fetchall()}

    def get_all_migration_files(self):
        """获取 migrations 目录下的所有迁移文件"""
        files = os.listdir(self.migrations_dir)
        return sorted(f for f in files if f.endswith(".py"))

    def get_pending_migrations(self):
        """获取未执行的迁移文件"""
        applied = self.get_applied_migrations()
        all_files = self.get_all_migration_files()
        pending = [f for f in all_files if f.replace(".py", "") not in applied]
        return pending

    def has_pending(self):
        """是否有未执行的迁移"""
        return len(self.get_pending_migrations()) > 0

    def print_pending(self):
        """打印未执行的迁移"""
        pending = self.get_pending_migrations()
        if not pending:
            logger.info("✅ 所有迁移已执行完成")
        else:
            logger.info("⚠️ 未执行的迁移:")
            for f in pending:
                logger.info(f" - {f}")

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
