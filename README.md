## 服务器启动命令
```angular2html
 honcho start
```
## 服务器说明

```html
redis配置:
    config/config.yml里面进行修改
flower地址:
    http://{ip}:5555
端口信息:
    [Procfile](Procfile)文件里面修改
```
## config.yml 配置文件说明
```html
save:
  dest_dir: "zip" # zip包保存路径
  cache: true # 是否使用缓存
server:
  redis: 'redis://localhost:6379/2' # redis地址
```

## jm_downloader.yml  配置文件说明

```html
官方说明 https://github.com/hect0x7/JMComic-Crawler-Python/blob/master/assets/docs/sources/option_file_syntax.md
```