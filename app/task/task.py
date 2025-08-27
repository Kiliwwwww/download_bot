import time

def count_words(text):
    print(f"Processing: {text}")
    time.sleep(5)  # 模拟耗时任务
    return len(text.split())

def add(x, y):
    time.sleep(2)
    return x + y
