
### 1️⃣ 构建 Docker 镜像

在 `Dockerfile` 所在目录打开终端，执行：

```bash
docker build  --no-cache -t jinman-bot .
```

说明：

* `-t jinman-not`：为镜像命名，可改为你喜欢的名字。
* `.`：表示 Dockerfile 在当前目录。

---

### 2️⃣ 运行容器并映射目录与端口

```bash
docker run -d --name docker-jinman -p 12345:12345 -p 9181:9181 \ 
  -v 你的config文件夹:/config -v 你的压缩包路径:/jinman/zip -v 你的图片存储路径:/jinman/books jinman-bot
```

💡 注意：

1. 映射的 `config` 文件夹必须包含以下文件：

   * `config.yml`
   * `jm_downloader.yml`
   * `Procfile`
2. 可以参考示例文件创建这些配置文件：

   * [Procfile.example](../Procfile.example)
   * [config.yml.example](../config/config.yml.example)
   * [jm\_downloader.yml.example](../config/jm_downloader.yml.example)

