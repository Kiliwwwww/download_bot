FROM python:3.12

# 安装 git 和 redis-server
RUN apt-get update && \
    apt-get install -y git redis-server && \
    rm -rf /var/lib/apt/lists/*

RUN rm -rf /jinman
WORKDIR /jinman

RUN git clone https://github.com/Kiliwwwww/download_bot.git /jinman

RUN chmod +x bash/docker_start.sh


CMD ["bash", "-c", "redis-server --daemonize yes && bash bash/docker_start.sh"]