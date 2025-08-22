import redis
from app.utils.yaml_config import config
from typing import Any, Dict, List, Tuple


JM_KEY = "jm_id:download_id_hash"

class RedisUtils:
    def __init__(self, redis_url: str = config.get("server.redis"), decode_responses=True):
        """
        初始化 Redis 连接
        :param redis_url: Redis URL，例如 redis://localhost:6379/2
        :param decode_responses: 是否自动解码
        """
        self.r = redis.Redis.from_url(redis_url, decode_responses=decode_responses)

    # ----------------- 字符串 -----------------
    def set(self, key: str, value: Any, ex: int = None):
        return self.r.set(name=key, value=value, ex=ex)

    def get(self, key: str) -> Any:
        return self.r.get(key)

    # ----------------- 哈希 -----------------
    def hset(self, name: str, key: str, value: Any):
        return self.r.hset(name, key, value)

    def hget(self, name: str, key: str) -> Any:
        return self.r.hget(name, key)

    def hgetall(self, name: str) -> Dict[str, Any]:
        return self.r.hgetall(name)

    # ----------------- 列表 -----------------
    def lpush(self, name: str, *values):
        return self.r.lpush(name, *values)

    def rpush(self, name: str, *values):
        return self.r.rpush(name, *values)

    def lrange(self, name: str, start: int = 0, end: int = -1) -> List[Any]:
        return self.r.lrange(name, start, end)

    def lpop(self, name: str) -> Any:
        return self.r.lpop(name)

    def rpop(self, name: str) -> Any:
        return self.r.rpop(name)

    # ----------------- 集合 -----------------
    def sadd(self, name: str, *values):
        return self.r.sadd(name, *values)

    def smembers(self, name: str) -> set:
        return self.r.smembers(name)

    def sismember(self, name: str, value) -> bool:
        return self.r.sismember(name, value)

    # ----------------- 有序集合 -----------------
    def zadd(self, name: str, mapping: Dict[str, float]):
        return self.r.zadd(name, mapping)

    def zrange(self, name: str, start: int = 0, end: int = -1, withscores: bool = False) -> List[Tuple[str, float]]:
        return self.r.zrange(name, start, end, withscores=withscores)

    # ----------------- 过期与删除 -----------------
    def expire(self, key: str, time: int):
        return self.r.expire(key, time)

    def delete(self, *keys):
        return self.r.delete(*keys)

    # ----------------- 管道 -----------------
    def pipeline(self):
        return self.r.pipeline()
