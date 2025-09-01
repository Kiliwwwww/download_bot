from pathlib import Path

from peewee import Model, SqliteDatabase

from app.utils.logger_utils import logger
from app.utils.yaml_config import config
BASE_DIR = Path(__file__).resolve().parents[1]

class DBManager:
    """
    数据库管理工具类，基于 Peewee 和 SQLite
    支持动态 Model 创建和 ActiveRecord 风格的链式 CRUD
    """
    _db = None

    @classmethod
    def init(cls):
        """初始化数据库连接（只执行一次）"""
        if cls._db is None:
            db_path = config.get("database.sqlite.database", "app.sqlite")
            db_path =  str(BASE_DIR / db_path)
            cls._db = SqliteDatabase(db_path)

    @classmethod
    def get_db(cls):
        """获取数据库实例"""
        cls.init()
        if cls._db is None:
            raise Exception("Database not initialized.")
        return cls._db

    @classmethod
    def model(cls, name, fields):
        """动态创建 Peewee Model 类"""
        db = cls.get_db()
        attrs = {'__module__': __name__,
                 'Meta': type('Meta', (), {'database': db})}
        attrs.update(fields)
        base_model = type(name, (BaseModel,), attrs)
        return base_model

    @staticmethod
    def to_dict(instance, only=None, exclude=None):
        """Peewee model 实例转换为 dict"""
        data = {}
        for field_name in instance._meta.fields:
            if only and field_name not in only:
                continue
            if exclude and field_name in exclude:
                continue
            data[field_name] = getattr(instance, field_name)
        return data


class QuerySet:
    """
    封装 Peewee 查询对象，支持链式查询和 to_dict()
    """
    def __init__(self, model, query):
        self.model = model
        self.query = query

    def where(self, **kwargs):
        new_query = self.query.where(*(getattr(self.model, k) == v for k, v in kwargs.items()))
        return QuerySet(self.model, new_query)

    def where_expr(self, *expressions):
        """支持 Peewee 复杂条件表达式，例如 !=、>、<"""
        new_query = self.query.where(*expressions)
        return QuerySet(self.model, new_query)

    def order(self, *fields):
        new_query = self.query.order_by(*fields)
        return QuerySet(self.model, new_query)

    def limit(self, n):
        new_query = self.query.limit(n)
        return QuerySet(self.model, new_query)

    def execute(self):
        return self.query.execute()

    def first(self, only=None, exclude=None):
        """返回单条记录"""
        obj = self.query.first()
        if obj:
            return DBManager.to_dict(obj, only=only, exclude=exclude)
        return None

    def to_dict(self, only=None, exclude=None):
        return [DBManager.to_dict(obj, only=only, exclude=exclude) for obj in self.query]

    def sql(self, pretty: bool = True):
        """打印或返回 SQL 语句"""
        sql, params = self.query.sql()
        if pretty:
            # 格式化输出（带参数）
            str = "SQL:", sql % tuple(repr(p) for p in params)
            logger.info(str)

    def select_fields(self, *fields):
        """
        选择查询的字段，例如：.select_fields('id', 'name')
        """
        columns = [getattr(self.model, f) for f in fields]
        new_query = self.model.select(*columns).where(self.query._where) if hasattr(self.query,
                                                                                    "_where") else self.model.select(
            *columns)
        return QuerySet(self.model, new_query)

    def pluck(self, *fields):
        """
        类似 Rails 的 pluck，直接返回指定字段的值列表
        使用示例：
            TaskRecord.objects().pluck('id') -> [1, 2, 3]
            TaskRecord.objects().pluck('id', 'name') -> [(1, 'Alice'), (2, 'Bob')]
        """
        columns = [getattr(self.model, f) for f in fields]
        query = self.model.select(*columns).where(self.query._where) if hasattr(self.query,
                                                                                "_where") else self.model.select(
            *columns)
        results = query.execute()
        if len(columns) == 1:
            return [getattr(r, fields[0]) for r in results]
        else:
            return [tuple(getattr(r, f) for f in fields) for r in results]

class BaseModel(Model):
    class Meta:
        database = None

    @classmethod
    def objects(cls):
        return QuerySet(cls, cls.select())

    # 链式 CRUD 方法保留
    @classmethod
    def create_record(cls, **kwargs):
        return cls.create(**kwargs)

    @classmethod
    def update_record(cls, filters, **kwargs):
        return cls.update(**kwargs).where(*(getattr(cls, k) == v for k, v in filters.items())).execute()

    @classmethod
    def delete_record(cls, **filters):
        return cls.delete().where(*(getattr(cls, k) == v for k, v in filters.items())).execute()
