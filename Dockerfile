# 使用官方 Python 3.12 镜像
FROM python:3.12

# 设置环境变量，避免 tzdata 配置交互
ENV DEBIAN_FRONTEND=noninteractive

# 更新 apt 并安装 lsof 和 tzdata
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        lsof \
        tzdata && \
    rm -rf /var/lib/apt/lists/*

# 设置时区（可根据需要修改）
ENV TZ=Asia/Shanghai


# 默认命令
CMD ["python3"]
