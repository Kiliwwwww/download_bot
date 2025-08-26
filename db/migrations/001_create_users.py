def upgrade(cursor):
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    """)

def downgrade(cursor):
    cursor.execute("DROP TABLE users;")
