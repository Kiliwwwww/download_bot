#!/bin/bash
set -e  # 遇到错误立即退出
set -o pipefail

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 脚本开始执行..."

# 切换目录
cd /jinman || { echo "[$(date '+%Y-%m-%d %H:%M:%S')] 目录 jinman 不存在"; exit 1; }

# 更新系统并安装依赖
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 更新系统并安装必要依赖..."
need_update=false

for pkg in lsof tzdata; do
  if ! dpkg -s $pkg >/dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 未检测到 $pkg，准备安装..."
    missing_pkgs+="$pkg "
    need_update=true
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已安装 $pkg"
  fi
done

if [ "$need_update" = true ]; then
  apt-get update -qq
  apt-get install -y -qq $missing_pkgs
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 所有依赖已安装，无需更新"
fi

# 设置时区
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo "Asia/Shanghai" > /etc/timezone
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已设置时区为 Asia/Shanghai"

# ========= 检查关键文件是否存在 =========
check_file() {
  local FILE=$1
  if [ ! -f "$FILE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 错误: 缺少必要文件 $FILE"
    exit 1
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已检测到文件 $FILE"
  fi
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检查关键配置和文件..."

check_file "config/config.yml"
check_file "config/jm_downloader.yml"
check_file "app.sqlite"
check_file "Procfile"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 所有关键文件已就绪"
# ========= 文件检查结束 =========


# 安装 Python 依赖
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 安装 Python 依赖..."
pip install --no-cache-dir -r requirements.txt

# 数据库迁移
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 执行数据库迁移..."
python migration_db.py

# ========= 以下是 start.sh 的逻辑 =========

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

  PIDS=$(lsof -t -i :$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 停止 $NAME（端口 $PORT）的进程中: $PIDS"
    kill $PIDS  # 发送 SIGTERM
    sleep 3     # 等待进程退出

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
stop_port $DASHBOARD_PORT "Dashboard 服务"
stop_port $WEB_PORT "WEB 服务"

# 确保 log 目录存在
mkdir -p log

# honcho 后台启动并输出日志到 log/production.log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 启动 honcho 后台服务..."
honcho start >> log/production.log 2>&1 &
echo "[$(date '+%Y-%m-%d %H:%M:%S')] honcho 已后台启动，日志输出到 log/production.log"

# ========= end start.sh =========

