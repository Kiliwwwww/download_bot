# create_migration.py 使用说明

## 1. 功能介绍

`create_migration.py` 是一个迁移脚本生成工具，功能类似 Rails 的 `rails generate migration`，用于：

1. 自动生成数据库迁移脚本文件。
2. 根据已有迁移文件自动生成 **递增编号**（001、002、003…）。
3. 生成标准模板，包含 `upgrade(cursor)` 和 `downgrade(cursor)` 函数，方便编写迁移逻辑。

---

## 2. 文件位置与目录要求

* 工具文件位置：项目根目录下

```
项目/
├── create_migration.py
├── db/
│   └── migrations/
```

* **迁移脚本目录**：`db/migrations/`
  所有生成的迁移脚本都会放到这个目录。
* **迁移脚本命名规则**：

  ```
  <递增编号>_<迁移名称>.py
  例如：
  001_create_users.py
  002_add_email_to_users.py
  ```
* **迁移脚本模板结构**：

```python
"""
Migration: <迁移名称>
Created at: <创建时间>
"""

def upgrade(cursor):
    # TODO: 写升级逻辑
    pass

def downgrade(cursor):
    # TODO: 写回滚逻辑
    pass
```

---

## 3. 使用步骤

### 3.1 打开命令行

进入项目根目录，确保 Python 环境可用。

### 3.2 执行生成命令

```bash
python create_migration.py <migration_name>
```

* `<migration_name>`：迁移名称，使用下划线 `_` 分隔多个单词，例如：

```bash
python create_migration.py create_users
python create_migration.py add_email_to_users
```

* 生成文件：

```
db/migrations/<递增编号>_<migration_name>.py
```

### 3.3 示例

```bash
python create_migration.py create_users
```

生成文件 `db/migrations/001_create_users.py` 内容示例：

```python
"""
Migration: create_users
Created at: 2025-08-26 10:45:00
"""

def upgrade(cursor):
    # TODO: 写升级逻辑
    pass

def downgrade(cursor):
    # TODO: 写回滚逻辑
    pass
```

### 3.4 编写迁移逻辑

1. 在 `upgrade(cursor)` 中写 **建表、增加字段、修改表结构** 等逻辑。
2. 在 `downgrade(cursor)` 中写 **回滚逻辑**，保证可以撤销迁移。

例如：

```python
def upgrade(cursor):
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    """)

def downgrade(cursor):
    cursor.execute("DROP TABLE users;")
```

---

## 4. 注意事项

1. **迁移脚本编号自动递增**

   * 工具会扫描 `db/migrations/` 下已有脚本的编号，生成下一个编号。
   * 迁移名称不要重复，避免覆盖已有文件。

2. **文件命名规范**

   * 全部使用小写字母和下划线 `_` 分隔单词。
   * 编号格式固定 3 位，例如 `001`、`002`。

3. **回滚逻辑**

   * SQLite 不支持直接删除列，需要通过新建临时表实现。
   * 确保 `downgrade(cursor)` 能正确撤销 `upgrade(cursor)` 的操作。

4. **与 migrator.py 配合使用**

   * 创建迁移脚本后，需要通过 migrator 工具执行：

   ```python
   from db.migrator import Migrator
   m = Migrator()
   m.migrate()  # 执行迁移
   ```

5. **保持迁移顺序**

   * 每次迁移尽量只修改一个功能点，保证迁移可控、易回滚。

---



* `create_migration.py` 是迁移脚本生成器，自动编号 + 模板生成。
* 配合 `migrator.py` 可以实现完整的 **数据库迁移/回滚管理**。
* 使用规范：

  1. 迁移名称用下划线 `_` 分隔。
  2. 编写完整的 `upgrade` 与 `downgrade` 逻辑。
  3. 保持迁移文件顺序和编号。

---

