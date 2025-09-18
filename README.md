# 项目文档

## 目录

* [项目介绍](#项目介绍)
* [项目结构说明](#项目结构说明)
* [使用说明](#使用说明)

  * [初始化步骤](#初始化步骤)
  * [服务器启动](#服务器启动)
  * [配置说明](#配置说明)
* [配置文件说明](#配置文件说明)

  * [config.yml](#configyml)
  * [jm\_downloader.yml](#jm_downloader-yml)

---

## 项目介绍

本项目是一个基于 **[Python jmcomic](https://github.com/hect0x7/JMComic-Crawler-Python)** 二次开发的简易服务器，提供以下功能：

* 异步下载漫画
* 自动打包为压缩包（zip）

后端技术栈：**FastAPI + RQ + Honcho + Redis**

前端技术栈：**Vue3 + Naive-ui**

---

## 使用说明
### 环境说明
```bash
# 推荐使用Linux环境或者是Macos
# 使用Window的同学可以配置Docker环境，在Docker环境下拉取python:3.12的镜像
docker pull python:3.12
```
Docker一键启动教程： [docker.md](md/docker.md)
### 初始化步骤

```bash
# 安装依赖
bash init_docker.sh
# 复制配置文件
cp config/config.yml.example config/config.yml
cp config/jm_downloader.yml.example config/jm_downloader.yml
# 执行迁移任务
python migration_db.py 
```

### 服务器启动

```bash
# 服务器启动
bash bash/start.sh
```
### 数据库说明
```bash
# 目前使用的是sqlite3作为内置数据库 以后有机会再改
# 运行服务器前执行迁移任务
python migration_db.py
# 如果你要创建你定制的脚本 则执行 这个流程类似于rails的db任务
python create_migration.py add_email_to_users
```

create_migration命令使用说明: [create_migration.md](md/create_migration.md)

db_manager.py工具类说明: [db_manager.md](md/db_manager.md)
### 配置说明

见 config/config.yml 文件

---

## 配置文件说明

### config.yml

```yaml
save:
  dest_dir: "zip" # 打包zip的地址
  cache: true # 是否使用缓存
server:
  redis: 'redis://192.168.2.130:6380/0' 
  port: 12345 # 服务器端口
  dashboard_port: 9181 # 异步任务监控端口
database:
  type: sqlite
#  mysql:
#    host: localhost
#    user: root
#    password: 123456
#    database: test
#    port: 3306
  sqlite:
    database: 'app.sqlite'


```

### jm\_downloader.yml

详细配置可参考官方文档：

[JMComic 配置文件语法说明](https://github.com/hect0x7/JMComic-Crawler-Python/blob/master/assets/docs/sources/option_file_syntax.md)

[JMComic 使用教程文档](https://jmcomic.readthedocs.io/zh-cn/latest/)

