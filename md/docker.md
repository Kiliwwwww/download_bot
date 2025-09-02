
### 1️⃣ 构建 Docker 镜像

在 `Dockerfile` 所在目录打开终端，执行：

```bash
docker build -t jinman .
```

* `-t jinman` 是给镜像起名字，可以改成你喜欢的名字。
* `.` 表示 Dockerfile 在当前目录。

---

### 2️⃣ 运行容器并映射目录与端口

```bash
docker run -it -v /git/jinman_pull_bot:/jinman -p 12345:12345 -p 9181:9181 --name jinman-container jinman bash
```

解释：

* `-it`：交互模式，可以进入容器终端。
* `-v /code/jinman:/jinman`：将本地 `/code/jinman` 映射到容器 `/jinman`。
* `-p 12345:12345 -p 9181:9181`：将容器的 12345 和 9181 端口映射到本地，12345 和 9181分别对应服务器端口和监控端口。
* `--name jinman-container`：给容器起个名字。
* `jinman`：使用上一步构建的镜像。

---

### 3️⃣ 进入容器

如果你想在容器里操作：

```bash
docker exec -it jinman-container env LANG=C.UTF-8 bash
```

然后就可以在 `/jinman` 下看到本地代码了。

然后通过命令启动服务器了
```bash
 # 启动服务器
 bash bash/start.sh
```