from db.database_tools import Database

class QueryBuilder:
    def __init__(self, table_name):
        self.db = Database()
        self.table_name = table_name
        self._joins = []        # 存储 (join_type, join_clause)
        self._wheres = []       # 存储 (condition, params)
        self._where_ors = []    # 存储 (condition, params)
        self._select = "*"
        self._order_by = ""
        self._limit = None
        self._offset = None
        self._group_by = ""

    # ---------------- JOIN ----------------
    def join(self, join_clause, join_type="INNER"):
        join_type = join_type.upper()
        if join_type not in ["INNER", "LEFT", "RIGHT", "FULL"]:
            raise ValueError("join_type 必须是 INNER, LEFT, RIGHT, FULL 之一")
        self._joins.append((join_type, join_clause))
        return self

    # ---------------- WHERE ----------------
    def where(self, condition, params=None):
        self._wheres.append((condition, params or []))
        return self

    def where_or(self, condition, params=None):
        self._where_ors.append((condition, params or []))
        return self

    def _build_where_clause(self):
        clauses = []
        params = []

        if self._wheres:
            conds = [c for c, _ in self._wheres]
            clauses.append("(" + " AND ".join(conds) + ")")
            for _, p in self._wheres:
                params.extend(p)

        if self._where_ors:
            conds = [c for c, _ in self._where_ors]
            clauses.append("(" + " OR ".join(conds) + ")")
            for _, p in self._where_ors:
                params.extend(p)

        if clauses:
            where_sql = " WHERE " + " OR ".join(clauses) if len(clauses) > 1 else " WHERE " + clauses[0]
            return where_sql, params
        return "", []

    def _build_join_clause(self):
        if not self._joins:
            return ""
        return " " + " ".join(f"{jt} JOIN {jc}" for jt, jc in self._joins)

    def _build_order_by(self):
        return f" ORDER BY {self._order_by}" if self._order_by else ""

    def _build_group_by(self):
        return f" GROUP BY {self._group_by}" if self._group_by else ""

    def _build_limit_offset(self):
        sql = ""
        if self._limit is not None:
            sql += f" LIMIT {self._limit}"
        if self._offset is not None:
            sql += f" OFFSET {self._offset}"
        return sql

    # ---------------- SELECT ----------------
    def select(self, columns="*"):
        self._select = columns
        sql = f"SELECT {self._select} FROM {self.table_name}"
        sql += self._build_join_clause()
        where_sql, params = self._build_where_clause()
        sql += where_sql
        sql += self._build_group_by()
        sql += self._build_order_by()
        sql += self._build_limit_offset()
        return self.db.query(sql, params)

    def query_one(self, columns="*"):
        self._select = columns
        sql = f"SELECT {self._select} FROM {self.table_name}"
        sql += self._build_join_clause()
        where_sql, params = self._build_where_clause()
        sql += where_sql
        sql += self._build_group_by()
        sql += self._build_order_by()
        sql += self._build_limit_offset()
        return self.db.query_one(sql, params)

    # ---------------- CREATE ----------------
    def create(self, data: dict):
        if not data:
            raise ValueError("create 方法需要提供字典 data")
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["%s"] * len(data))
        values = list(data.values())
        sql = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"
        success = self.db.execute(sql, values)
        if success:
            last_id = self.db.cursor.lastrowid
            try:
                return self.where("id=%s", [last_id]).query_one()
            except:
                return self.select().query_one()
        return None

    # ---------------- UPDATE ----------------
    def update(self, data: dict):
        if not data:
            raise ValueError("update 方法需要提供字典 data")
        if not self._wheres and not self._where_ors:
            raise ValueError("update 必须指定 where 条件，防止全表更新")
        set_clause = ", ".join(f"{k}=%s" for k in data.keys())
        values = list(data.values())
        sql = f"UPDATE {self.table_name} SET {set_clause}"
        where_sql, where_params = self._build_where_clause()
        sql += where_sql
        values.extend(where_params)
        return self.db.execute(sql, values)

    # ---------------- DELETE ----------------
    def delete(self):
        if not self._wheres and not self._where_ors:
            raise ValueError("delete 必须指定 where 条件，防止全表删除")
        sql = f"DELETE FROM {self.table_name}"
        where_sql, params = self._build_where_clause()
        sql += where_sql
        return self.db.execute(sql, params)

    # ---------------- ORDER / LIMIT / GROUP ----------------
    def order_by(self, clause):
        self._order_by = clause
        return self

    def limit(self, n):
        self._limit = n
        return self

    def offset(self, n):
        self._offset = n
        return self

    def group_by(self, clause):
        self._group_by = clause
        return self

# ---------------- 辅助函数 ----------------
def table(name):
    return QueryBuilder(name)
