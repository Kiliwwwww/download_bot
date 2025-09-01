"""
Migration: add_table_job_items
Created at: 2025-09-01 11:44:33
"""

def upgrade(cursor):
    cursor.execute("""
    
    CREATE TABLE job_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT,
      task_type TEXT,
      status TEXT,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      user_id INTEGER
    );
    
    
""")
    cursor.execute("""
CREATE INDEX index_job_items_on_task_id ON job_items (task_id);
""")
    cursor.execute("""
CREATE INDEX index_job_items_on_task_type ON job_items (task_type);
""")
    pass

def downgrade(cursor):
    cursor.execute("""
    DROP TABLE IF EXISTS job_items;
    """)
    pass
