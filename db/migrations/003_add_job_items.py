"""
Migration: add_job_items
Created at: 2025-09-01 09:29:03
"""

def upgrade(cursor):
    cursor.execute("""
ALTER TABLE task_records ADD COLUMN total_count INTEGER;
                   """)
    cursor.execute("""
ALTER TABLE task_records ADD COLUMN finished_count INTEGER;
                   """)
    pass

def downgrade(cursor):

    pass
