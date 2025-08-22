## 服务器启动命令
```angular2html
 honcho start
```
## 服务器必装

```html
redis:
    redis的链接配置在config/config.yml里面进行修改
```
## config.yml 配置文件说明
```html
save:
  dest_dir: "zip" # zip包保存路径
server:
  redis: 'redis://localhost:6379/2' # redis地址
```

## jm_downloader.yml  配置文件说明

```html
官方说明 https://github.com/hect0x7/JMComic-Crawler-Python/blob/master/assets/docs/sources/option_file_syntax.md
```