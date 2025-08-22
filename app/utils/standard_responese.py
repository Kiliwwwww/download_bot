from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

# 定义通用响应模型
T = TypeVar('T')


class StandardResponse(BaseModel, Generic[T]):
    """标准API响应格式"""
    code: int = 200  # 状态码，200表示成功
    message: str = "success"  # 状态描述信息
    data: Optional[T] = None  # 业务数据，根据实际情况变化
    request_id: Optional[str] = None  # 请求ID，用于追踪

    class Config:
        arbitrary_types_allowed = True
