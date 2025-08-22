import os


def print_directory_tree(root_dir, exclude_folders=None):
    """
    打印指定目录的树形结构，可排除指定文件夹

    参数:
        root_dir: 要遍历的根目录
        exclude_folders: 要排除的文件夹列表，默认为空
    """
    if exclude_folders is None:
        exclude_folders = []

    print(f"{os.path.basename(root_dir)}/")
    items = os.listdir(root_dir)

    # 过滤掉要排除的文件夹
    filtered_items = []
    for item in items:
        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path) and item in exclude_folders:
            continue  # 跳过要排除的文件夹
        filtered_items.append(item)

    # 分离目录和文件并排序
    dirs = sorted([item for item in filtered_items if os.path.isdir(os.path.join(root_dir, item))])
    files = sorted([item for item in filtered_items if os.path.isfile(os.path.join(root_dir, item))])
    all_items = dirs + files

    for i, item in enumerate(all_items):
        path = os.path.join(root_dir, item)
        is_last = i == len(all_items) - 1
        prefix = "└── " if is_last else "├── "
        print(f"{prefix}{item}")

        # 递归处理子目录
        if os.path.isdir(path):
            sub_prefix = "    " if is_last else "│   "
            print_subdirectory(path, sub_prefix, exclude_folders)


def print_subdirectory(root_dir, prefix, exclude_folders):
    """递归打印子目录内容，支持排除文件夹"""
    items = os.listdir(root_dir)

    # 过滤掉要排除的文件夹
    filtered_items = []
    for item in items:
        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path) and item in exclude_folders:
            continue  # 跳过要排除的文件夹
        filtered_items.append(item)

    dirs = sorted([item for item in filtered_items if os.path.isdir(os.path.join(root_dir, item))])
    files = sorted([item for item in filtered_items if os.path.isfile(os.path.join(root_dir, item))])
    all_items = dirs + files

    for i, item in enumerate(all_items):
        path = os.path.join(root_dir, item)
        is_last = i == len(all_items) - 1
        sub_prefix = "└── " if is_last else "├── "
        print(f"{prefix}{sub_prefix}{item}")

        if os.path.isdir(path):
            new_prefix = f"{prefix}    " if is_last else f"{prefix}│   "
            print_subdirectory(path, new_prefix, exclude_folders)


if __name__ == "__main__":
    target_dir = "../jinman"  # 替换为你要查看的目录
    # 在这里指定要排除的文件夹，例如排除"venv"和"__pycache__"
    exclude = [".venv", "__pycache__", "tests", ".git", ".idea"]

    if os.path.exists(target_dir) and os.path.isdir(target_dir):
        print_directory_tree(target_dir, exclude)
    else:
        print(f"目录 '{target_dir}' 不存在或不是有效的目录")
