from app.utils.logger_utils import logger
from db.migrator import Migrator

logger.info("=====迁移任务执行开始=====")
m = Migrator()
m.migrate()   # 运行所有未执行的迁移
logger.info("=====迁移任务执行结束=====")