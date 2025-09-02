#!/bin/bash
set -e  # 遇到错误立即退出
set -o pipefail

# ======== 颜色定义 =========
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

log_info()    { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${RESET}"; }
log_warn()    { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${RESET}"; }
log_error()   { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${RESET}"; }

log_info "脚本开始执行..."

# 切换目录
cd /jinman || { log_error "目录 /jinman 不存在"; exit 1; }

# ======== 检查并安装依赖 =========
log_info "检查并安装必要依赖..."
need_update=false
missing_pkgs=""

for pkg in lsof tzdata; do
  if ! dpkg -s $pkg >/dev/null 2>&1; then
    log_warn "未检测到 $pkg，准备安装..."
    missing_pkgs+="$pkg "
    need_update=true
  else
    log_info "$pkg 已安装"
  fi
done

if [ "$need_update" = true ]; then
  apt-get update
  apt-get install -y tzdata
  apt-get install -y lsof
else
  log_info "所有依赖已安装，无需更新"
fi

# 设置时区
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo "Asia/Shanghai" > /etc/timezone
log_info "已设置时区为 Asia/Shanghai"

# ========= 检查关键文件 =========
log_info "检查关键配置和文件..."

check_file() {
  local FILE=$1
  if [ ! -f "$FILE" ]; then
    log_error "缺少必要文件 $FILE"
    exit 1
  else
    log_info "已检测到文件 $FILE"
  fi
}

check_file "config/config.yml"
check_file "config/jm_downloader.yml"
#check_file "app.sqlite"
check_file "Procfile"

log_info "所有关键文件已就绪"

# ======== 安装 Python 依赖 ========
log_info "安装 Python 依赖..."
pip install --no-cache-dir -r requirements.txt

# ======== 数据库迁移 ========
log_info "执行数据库迁移..."
python migration_db.py

# ======== start.sh 逻辑 ========
eval $(python app/init/export_env.py)
log_info "启动脚本开始执行..."

# 优雅停止端口函数
stop_port() {
  local PORT=$1
  local NAME=$2
  if [ -z "$PORT" ]; then
    return
  fi

  PIDS=$(lsof -t -i :$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    log_warn "停止 $NAME（端口 $PORT）的进程中: $PIDS"
    kill $PIDS
    sleep 3
    for PID in $PIDS; do
      if kill -0 $PID 2>/dev/null; then
        log_warn "$NAME 进程 $PID 未退出，使用 SIGKILL 强制杀掉"
        kill -9 $PID
      fi
    done
  else
    log_info "$NAME（端口 $PORT）没有正在运行的进程"
  fi
}

# 停止服务
stop_port $DASHBOARD_PORT "Dashboard 服务"
stop_port $WEB_PORT "WEB 服务"

# 确保日志目录存在
mkdir -p log

# 启动 honcho
log_info "启动 honcho 后台服务..."
honcho start -c worker=$WORK_SIZE >> log/production.log 2>&1 &
log_info "honcho 已后台启动，日志输出到 log/production.log"

