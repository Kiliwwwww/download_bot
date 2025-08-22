# 项目文档

## 目录
- [项目介绍](#项目介绍)
- [使用说明](#使用说明)
  - [服务器启动](#服务器启动)
  - [初始化步骤](#初始化步骤)
  - [配置说明](#配置说明)
- [配置文件说明](#配置文件说明)
  - [config.yml](#configyml)
  - [jm_downloader.yml](#jm_downloaderyml)

---

## 项目介绍
本项目是一个基于 **Python jmcomic** 二次开发的简易服务器，提供以下功能：
- 异步下载漫画
- 自动打包为压缩包（zip）

技术栈：**FastAPI + Celery + Honcho + Redis**

---

## 使用说明

### 初始化步骤
```bash
# 安装依赖
pip install -r requirements.txt
#复制配置文件
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

