#!/bin/bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 启动脚本开始执行..."
# 杀掉 15555 端口的进程
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在杀掉端口 15555"
kill $(lsof -t -i :15555) 2>/dev/null
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在杀掉端口 12345"
# 杀掉 12345 端口的进程
kill $(lsof -t -i :12345) 2>/dev/null

honcho start