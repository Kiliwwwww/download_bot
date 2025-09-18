# 使用 Python 官方轻量版镜像
FROM python:3.12

# 安装 git（如果需要从 Git 拉代码）
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN rm -rf /jinman
# 设置工作目录
WORKDIR /jinman

# 如果你是私有仓库，这里可以改成 ssh 或 token
RUN git clone https://github.com/Kiliwwwww/download_bot.git /jinman

# 进入jinman目录并且执行 bash bash/start.sh
# 帮我完善
# 给 start.sh 添加可执行权限
RUN chmod +x bash/docker_start.sh

# 容器启动时执行 start.sh
CMD ["bash", "bash/docker_start.sh"]
