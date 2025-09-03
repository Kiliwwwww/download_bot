"""
Migration: add_item_id_and_item_type_in_job_items
Created at: 2025-09-03 09:26:40
"""

def upgrade(cursor):
    cursor.execute("""
                   ALTER TABLE job_items ADD COLUMN item_id INTEGER;
                   """)
    cursor.execute("""
                   ALTER TABLE job_items ADD COLUMN item_type TEXT;
                   """)
    pass

def downgrade(cursor):
    pass
