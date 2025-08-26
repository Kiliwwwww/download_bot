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

后端技术栈：**FastAPI + Celery + Honcho + Redis**

前端技术栈：**Vue3 + Naive-ui**

---

## 项目结构说明

```
jinman/
├── app/                               # 核心业务逻辑和服务
│   ├── celery/                        # Celery 相关任务处理
│   │   ├── celery_worker.py           # Celery worker 启动文件
│   │   └── task_manager.py            # 任务管理逻辑
│   ├── fast/                          # FastAPI 相关模块
│   │   ├── controller/                # 控制器层，处理请求逻辑
│   │   │   ├── admin/                 # 管理员相关接口
│   │   ├── router/                    # 路由配置
│   │   ├── service/                   # 服务层，业务逻辑封装
│   │   └── fast_app.py                # FastAPI 主程序入口
│   ├── init/                           # 初始化相关模块
│   ├── job/                            # 后台作业、定时任务
│   └── utils/                          # 工具类、公共方法
├── books/                              # 书籍或资源存储目录
├── config/                             # 配置文件
├── db/                                 # 数据库相关
│   ├── migrations/                     # 数据库迁移脚本
│   ├── database_tools.py               # 数据库工具类（连接、查询）
│   ├── migration_checker.py            # 检测未执行迁移的工具
│   └── migrator.py                     # 迁移执行器
├── logs/                               # 日志文件存放目录
│   └── logger.log
├── public/                             # 静态文件目录
│   ├── js/
│   │   ├── api/                        # JS API 封装
│   │   └── components/                 # 前端组件
├── templates/                           # 前端模板文件（HTML）
├── zip/                                 # ZIP 文件存放目录
├── Procfile                             # 部署配置文件（Heroku 或类似环境）
├── README.md                             # 项目说明文档
├── app.sqlite                            # SQLite 数据库文件
├── create_migration.py                   # 自动生成迁移脚本工具
├── main.py                               # 项目启动入口
├── migration_db.py                       # 数据库迁移脚本入口（可执行迁移）
├── requirements.txt                      # Python 依赖列表

```


---

## 使用说明
### 环境说明
```bash
# 推荐使用Linux环境或者是Macos
# 使用Window的同学可以配置Docker环境，在Docker环境下拉取python:3.12的镜像
docker pull python:3.12
```

### 初始化步骤

```bash
# 安装依赖
pip install -r requirements.txt

# 复制配置文件
cp config/config.yml.example config/config.yml
cp config/jm_downloader.yml.example config/jm_downloader.yml
# 执行迁移任务
python migration_db.py 
```

### 服务器启动

```bash
# 服务器启动
honcho start
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
### 配置说明

* **Redis 配置**
  修改 `config/config.yml` 文件中的 `server.redis` 字段。
* **Flower 监控地址**
  `http://{ip}:5555`
* **端口配置**
  修改 [Procfile](Procfile) 文件。

---

## 配置文件说明

### config.yml

```yaml
save:
  dest_dir: "zip"       # zip 包保存路径
  cache: true           # 是否启用缓存
server:
  redis: "redis://localhost:6379/2"  # Redis 地址
```

### jm\_downloader.yml

详细配置可参考官方文档：
[JMComic 配置文件语法说明](https://github.com/hect0x7/JMComic-Crawler-Python/blob/master/assets/docs/sources/option_file_syntax.md)

