"""
Migration: add_task_records
Created at: 2025-08-26 14:44:49
"""

def upgrade(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 主键，自增
        task_id TEXT NOT NULL,                 -- 任务id
        status TEXT NOT NULL,                  -- 状态
        start_time DATETIME,                   -- 开始时间
        end_time DATETIME,                     -- 完成时间
        user_id TEXT NOT NULL,                 -- 用户id
        result TEXT                            -- 结果
    );
    """)
    pass

def downgrade(cursor):
    cursor.execute("""
    DROP TABLE IF EXISTS task_records;
    """)
    pass
