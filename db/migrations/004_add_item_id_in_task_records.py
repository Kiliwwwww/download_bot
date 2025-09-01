"""
Migration: add_item_id_in_task_records
Created at: 2025-09-01 11:08:19
"""

def upgrade(cursor):
    cursor.execute("""
                   ALTER TABLE task_records ADD COLUMN item_id INTEGER;
                   """)
    pass

def downgrade(cursor):
    pass
