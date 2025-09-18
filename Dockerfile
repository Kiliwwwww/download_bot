FROM python:3.12

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN rm -rf /jinman
WORKDIR /jinman

RUN git clone https://github.com/Kiliwwwww/download_bot.git /jinman

RUN chmod +x bash/docker_start.sh

CMD ["bash", "bash/docker_start.sh"]
