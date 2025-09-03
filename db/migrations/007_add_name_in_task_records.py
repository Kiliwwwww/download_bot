"""
Migration: add_name_in_task_records
Created at: 2025-09-03 14:11:42
"""

def upgrade(cursor):
    cursor.execute("""
                   ALTER TABLE task_records ADD COLUMN name TEXT;
                   """)
    pass

def downgrade(cursor):
    pass
