import os
import sys
from datetime import datetime

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "db", "migrations")

TEMPLATE = '''"""
Migration: {name}
Created at: {created_at}
"""

def upgrade(cursor):
    # TODO: Write your upgrade SQL here
    pass

def downgrade(cursor):
    # TODO: Write your downgrade SQL here
    pass
'''


def get_next_migration_number():
    files = os.listdir(MIGRATIONS_DIR)
    numbers = []
    for f in files:
        if f.endswith(".py") and f[0:3].isdigit():
            numbers.append(int(f[0:3]))
    next_number = max(numbers, default=0) + 1
    return f"{next_number:03d}"


def create_migration(name):
    number = get_next_migration_number()
    filename = f"{number}_{name}.py"
    filepath = os.path.join(MIGRATIONS_DIR, filename)

    content = TEMPLATE.format(
        name=name,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ Created migration {filepath}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_migration.py <migration_name>")
        sys.exit(1)

    migration_name = "_".join(sys.argv[1:])
    create_migration(migration_name)
