class Paginator:
    """
    通用分页工具类
    """
    def __init__(self, items, page=1, per_page=20):
        self.items = items
        self.page = max(1, int(page))
        self.per_page = max(1, int(per_page))
        self.total = len(items)

    def get_page(self):
        start = (self.page - 1) * self.per_page
        end = start + self.per_page
        return {
            "total": self.total,
            "page": self.page,
            "per_page": self.per_page,
            "items": self.items[start:end]
        }

    @staticmethod
    def sort(items, sort_key=None, reverse=True, default_value=None):
        """
        对列表进行排序
        :param items: 待排序列表
        :param sort_key: 排序字段，如果为 None 则不排序
        :param reverse: 是否倒序
        :param default_value: 当元素缺少 sort_key 时的默认值
        :return: 排序后的列表
        """
        if not sort_key:
            return items  # 不排序
        return sorted(
            items,
            key=lambda x: x.get(sort_key, default_value),
            reverse=reverse
        )
