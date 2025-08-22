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

技术栈：**FastAPI + Celery + Honcho + Redis**

---

## 项目结构说明

```
jinman/
├── app/                   # 应用主代码
│   ├── celery/            # Celery 任务相关代码
│   ├── fast/              # FastAPI 相关代码
│   │   ├── controller/    # API 控制器，处理请求逻辑
│   │   ├── router/        # 路由定义，注册 API endpoint
│   │   ├── service/       # 核心业务逻辑服务层
│   ├── init/              # 项目初始化工具及启动前检查
│   ├── job/               # 定时任务或后台作业
│   └── utils/             # 公共工具类，如日志、配置解析、文件处理
├── books/                 # 漫画下载的源文件或缓存
├── config/                # 配置文件
│   ├── config.yml         # 服务器及缓存配置
│   └── jm_downloader.yml  # JMComic 下载器配置
├── logs/                  # 日志文件目录
├── zip/                   # 下载漫画打包后的 zip 文件保存目录
└── Procfile               # Honcho 启动配置文件
```

> 各目录说明：
>
> * **app/celery**：存放 Celery worker 和任务定义。
> * **app/fast**：FastAPI 框架相关，分为路由、控制器和服务层，便于模块化开发。
> * **app/init**：启动前初始化检查，例如目录创建、配置检查。
> * **app/job**：定时任务或异步后台作业。
> * **app/utils**：日志、YAML 解析、文件操作等工具。
> * **books/**：漫画源文件存放目录。
> * **config/**：项目运行所需配置文件。
> * **logs/**：应用运行日志。
> * **zip/**：打包好的漫画文件存放目录。
> * **Procfile**：Honcho 启动服务定义，包括 web 和 worker。

---

## 使用说明

### 初始化步骤

```bash
# 安装依赖
pip install -r requirements.txt

# 复制配置文件
cp config/config.yml.example config/config.yml
cp config/jm_downloader.yml.example config/jm_downloader.yml 
```

### 服务器启动

```bash
# 服务器启动
honcho start
```

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

