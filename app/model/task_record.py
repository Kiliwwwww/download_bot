from peewee import *

from app.model.json_field import JSONField
from db.db_manager import DBManager

# 状态码
status = {
    'running': "RUNNING",
    'success': "SUCCESS",
    'failed': "FAILED"
}
TaskRecord = DBManager.model("task_records", {
    "id": IntegerField(primary_key=True),  # 主键，自增
    "task_id": CharField(null=False),  # 任务id，非空
    "status": CharField(null=False),   # 状态，非空
    "start_time": DateTimeField(null=True),  # 开始时间，可为空
    "end_time": DateTimeField(null=True),    # 完成时间，可为空
    "user_id": CharField(null=False),  # 用户id，非空
    "result": JSONField(null=True)     # 结果，可为空，使用TextField适合较长内容
})
