import os
import sqlite3
import importlib.util
from app.utils.yaml_config import config


class Migrator:
    def __init__(self):
        # 从配置里拿 sqlite 数据库路径
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

    def applied_migrations(self):
        """获取已应用的迁移版本"""
        self.cursor.execute("SELECT version FROM schema_migrations;")
        return {row[0] for row in self.cursor.fetchall()}

    def _load_migration_module(self, filename):
        """动态导入迁移文件"""
        module_name = filename.replace(".py", "")
        path = os.path.join(self.migrations_dir, filename)
        spec = importlib.util.spec_from_file_location(module_name, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module, module_name

    def apply_migration(self, filename, direction="up"):
        """执行单个迁移"""
        module, version = self._load_migration_module(filename)

        try:
            if direction == "up":
                module.upgrade(self.cursor)
                self.cursor.execute("INSERT INTO schema_migrations (version) VALUES (?);", (version,))
            else:
                module.downgrade(self.cursor)
                self.cursor.execute("DELETE FROM schema_migrations WHERE version=?;", (version,))
            self.conn.commit()
            print(f"迁移 {direction} 成功: {version}")
        except Exception as e:
            self.conn.rollback()
            print(f"迁移 {direction} 失败: {version} -> {e}")
            raise

    def migrate(self):
        """执行所有未应用的迁移"""
        applied = self.applied_migrations()
        files = sorted(f for f in os.listdir(self.migrations_dir) if f.endswith(".py"))

        for f in files:
            version = f.replace(".py", "")
            if version not in applied:
                self.apply_migration(f, direction="up")

    def rollback(self, steps=1):
        """回滚最近的迁移"""
        applied = sorted(list(self.applied_migrations()), reverse=True)
        for version in applied[:steps]:
            self.apply_migration(f"{version}.py", direction="down")
