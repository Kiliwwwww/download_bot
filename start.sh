#!/bin/bash

# 导入环境变量
eval $(python app/init/export_env.py)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 启动脚本开始执行..."

# 杀掉 WEB_PORT 端口的进程
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在杀掉端口 $WEB_PORT"
kill $(lsof -t -i :$WEB_PORT) 2>/dev/null

# 杀掉 DASHBOARD_PORT 端口的进程
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在杀掉端口 $DASHBOARD_PORT"
kill $(lsof -t -i :$DASHBOARD_PORT) 2>/dev/null

honcho start
