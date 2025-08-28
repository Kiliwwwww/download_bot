#!/bin/bash

# 导入环境变量
eval $(python app/init/export_env.py)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 启动脚本开始执行..."

# 函数：优雅停止端口对应进程
stop_port() {
  local PORT=$1
  local NAME=$2
  if [ -z "$PORT" ]; then
    return
  fi

  PIDS=$(lsof -t -i :$PORT)
  if [ -n "$PIDS" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 尝试停止 $NAME（端口 $PORT）的进程: $PIDS"
    kill $PIDS  # 发送 SIGTERM
    sleep 5     # 等待进程退出

    # 检查进程是否仍在运行，必要时强制杀掉
    for PID in $PIDS; do
      if kill -0 $PID 2>/dev/null; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $NAME 进程 $PID 未退出，使用 SIGKILL 强制杀掉"
        kill -9 $PID
      fi
    done
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $NAME（端口 $PORT）没有正在运行的进程"
  fi
}

# 停止 WEB_PORT 和 DASHBOARD_PORT
stop_port $WEB_PORT "WEB 服务"
stop_port $DASHBOARD_PORT "Dashboard 服务"

# 确保 log 目录存在
mkdir -p log

# honcho 后台启动并输出日志到 log/production.log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 启动 honcho 后台服务..."
honcho start >> log/production.log 2>&1 &
echo "[$(date '+%Y-%m-%d %H:%M:%S')] honcho 已后台启动，日志输出到 log/production.log"
