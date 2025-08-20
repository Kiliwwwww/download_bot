import jmcomic

# 创建配置对象
option = jmcomic.create_option_by_file('config.yml')
# 使用option对象来下载本子
data = jmcomic.download_album(1197344, option)
print(data)
# 等价写法: option.download_album(422866)