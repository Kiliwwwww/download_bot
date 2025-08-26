# DBManager 使用说明文档

## 概述
`DBManager` 是一个基于 **Peewee ORM** 和 **SQLite** 的数据库管理工具类，支持：
- 动态创建 Model（表）
- ActiveRecord 风格的链式 CRUD 查询
- 查询结果直接转换为字典，便于返回 JSON 或处理数据

适用于 Python 项目中快速构建数据库访问层。

1. 支持动态 Model 创建
2. ActiveRecord 风格链式 CRUD
3. 查询结果可直接 `.to_dict()` 返回字典列表
4. 自动创建 SQLite 数据库目录
5. 轻量、易用，适合快速开发 Python 项目

---

## 文件结构
```text
db_manager.py
├─ DBManager      # 数据库管理类
├─ QuerySet       # 封装 Peewee 查询对象，实现链式查询
└─ BaseModel      # 所有动态 Model 的基类，提供链式 CRUD
````

---

## 配置

数据库路径通过 `config.get("database.sqlite.database", "app.sqlite")` 读取：

```python
db_path = config.get("database.sqlite.database", "app.sqlite")
```

---

## DBManager 类

### 方法

#### `init()`

初始化数据库连接（只执行一次）

```python
DBManager.init()
```

#### `get_db()`

获取数据库实例

```python
db = DBManager.get_db()
```

#### `model(name, fields)`

动态创建 Peewee Model 类

* `name`: 表名
* `fields`: 字段字典，例如 `{"name": CharField(), "age": IntegerField()}`

```python
from peewee import CharField, IntegerField

User = DBManager.model("User", {
    "name": CharField(),
    "age": IntegerField()
})
```

#### `to_dict(instance, only=None, exclude=None)`

将 Peewee 模型实例转换为字典

* `only`: 可选，只包含指定字段
* `exclude`: 可选，排除指定字段

```python
user_dict = DBManager.to_dict(user, exclude=['id'])
```

---

## QuerySet 类

封装 Peewee 查询对象，实现链式查询和统一转换为字典。

### 方法

* `where(**kwargs)`：条件查询
* `order_by_field(*fields)`：排序
* `limit_records(n)`：限制返回条数
* `execute()`：执行查询
* `to_dict(only=None, exclude=None)`：将结果集转换为字典列表

```python
users = User.objects().where(name="Alice").order_by_field(User.age.desc()).limit_records(5).to_dict()
```

---

## BaseModel 类

所有动态 Model 都继承自 `BaseModel`，支持链式查询和 CRUD 方法。

### 链式查询

```python
users = User.objects().where(age__gt=20).order_by_field(User.age.desc()).limit_records(10)
```

### CRUD 方法

#### `create_record(**kwargs)`

创建记录

```python
User.create_record(name="Alice", age=25)
```

#### `update_record(filters, **kwargs)`

更新记录

```python
User.update_record({"name": "Alice"}, age=26).execute()
```

#### `delete_record(**filters)`

删除记录

```python
User.delete_record(name="Alice").execute()
```

### 查询结果直接转字典

```python
users_dict = User.objects().where(name="Alice").to_dict()
# [{'id': 1, 'name': 'Alice', 'age': 26}]
```

---

## 使用示例

```python
from peewee import CharField, IntegerField

from db.db_manager import DBManager

User = DBManager.model("users", {
    "id": IntegerField(),
    "name": CharField()
})

# 创建数据
User.create_record(name="Alice", age=25)

# 链式查询 + 转字典
users_dict = User.objects().where(age__gt=20).order_by_field(User.age.desc()).limit_records(5).to_dict()
print(users_dict)

# 更新数据
User.update_record({"name": "Alice"}, age=26).execute()

# 删除数据
User.delete_record(name="Alice").execute()
```

