# QueryBuilder 工具类说明文档

## 1. 功能概述

`QueryBuilder` 是基于 Python 封装的数据库操作工具类，灵感来自 Rails 的 ActiveRecord，提供链式调用风格的 **增删改查** 功能，并支持多种 SQL 语法扩展。

主要特点：

* 链式查询，语法简洁清晰。
* 支持 SQLite 和 MySQL。
* 支持多种 **JOIN**：INNER / LEFT / RIGHT / FULL。
* 支持 **where() / where\_or() 条件组合**，并自动处理优先级。
* 支持 **ORDER BY、GROUP BY、LIMIT、OFFSET**。
* **参数化 SQL**，防止 SQL 注入。
* CREATE 操作返回新插入对象。
* DELETE / UPDATE 强制要求 WHERE 条件，防止误操作全表。

---

## 2. 安装与初始化

```python
from query_builder import table

# 初始化操作直接通过 table("表名") 获取 QueryBuilder 对象
qb = table("users")
```

> 内部依赖 `Database` 工具类，支持 SQLite/MySQL，配置来自 `config/config.yml`。

---

## 3. 查询操作（SELECT）

```python
# 查询单条
user = table("users").where("id=%s", [1]).query_one()

# 查询多条
users = table("users").where("status=%s", [1]).select("*")

# 链式 join
table("users")\
    .join("schools on users.id = schools.user_id", "LEFT")\
    .where("users.status=%s", [1])\
    .select("*")

# 条件组合
table("users")\
    .where("status=%s", [1])\
    .where_or("role=%s", ["admin"])\
    .select("*")
```

---

## 4. 增加数据（CREATE）

```python
new_user = table("users").create({
    "name": "Alice",
    "email": "alice@example.com"
})

print(new_user)
# 返回插入的对象，自动识别主键列
```

---

## 5. 更新数据（UPDATE）

```python
# 单条件更新
table("users").where("id=%s", [1]).update({"name": "Bob"})

# 多条件组合
table("users")\
    .where("status=%s", [1])\
    .where_or("role=%s", ["admin"])\
    .update({"status": 2})
```

> ⚠️ 没有 where 条件时会抛异常，防止全表更新。

---

## 6. 删除数据（DELETE）

```python
# 单条件删除
table("users").where("id=%s", [1]).delete()

# 多条件删除
table("users")\
    .where("status=%s", [0])\
    .where_or("role=%s", ["guest"])\
    .delete()
```

> ⚠️ 必须指定 where 条件，否则抛异常，防止全表删除。

---

## 7. 排序、分页和分组

```python
# 排序
table("users").order_by("created_at DESC").select("*")

# 分页
table("users").limit(10).offset(20).select("*")

# 分组统计
table("users").group_by("role").select("role, COUNT(*) as total")
```

---

## 8. 支持的 JOIN 类型

* INNER JOIN（默认）
* LEFT JOIN
* RIGHT JOIN
* FULL JOIN

```python
table("users").join("schools on users.id = schools.user_id", "LEFT").select("*")
```

---

## 9. 参数化示例（防止 SQL 注入）

```python
table("users").where("id=%s AND status=%s", [1, 1]).select("*")
```

* `where()` 和 `where_or()` 都可以传参数列表。
* CREATE 和 UPDATE 也使用参数化 SQL。

---

## 10. 注意事项

1. **UPDATE / DELETE 必须指定 where 条件**，否则会抛异常。
2. **CREATE 假设表有自增主键**，默认返回 `id` 对应对象。
3. **复杂 AND/OR 混合逻辑**，可以手动在 where 条件中加括号。
4. **JOIN 条件需要用户自己保证语法正确**，QueryBuilder 只负责拼接。

---


`QueryBuilder` 提供了类似 Rails ActiveRecord 的链式查询语法，同时兼顾 Python 的简洁和安全。

* **CRUD 全覆盖**
* **链式调用风格**
* **多 join、where 条件组合**
* **排序、分页、分组**
* **参数化 SQL 安全**
* **防止全表误操作**


---
