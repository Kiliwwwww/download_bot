from peewee import *

from db.db_manager import DBManager

# 类型
SYNC_FINISHED_COUNT = "sync_finished_count"

JobItem = DBManager.model("job_items", {
    "id": IntegerField(primary_key=True),  # 主键，自增
    "task_id": CharField(null=False),  # 任务id，非空
    "task_type": CharField(null=False),   # 状态，非空
    "status": CharField(null=False),  # 开始时间，可为空
    "created_at": DateTimeField(null=True),    # 完成时间，可为空
    "updated_at": DateTimeField(null=False),  # 用户id，非空
    "user_id": IntegerField(null=True),     # 结果，可为空，使用TextField适合较长内容
})
