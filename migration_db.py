from db.migrator import Migrator

m = Migrator()
m.migrate()   # 运行所有未执行的迁移
