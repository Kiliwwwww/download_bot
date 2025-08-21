import uvicorn

from app.utils.yaml_config import YamlConfig, CONFIG_FILE
from app.init.app_initializer import AppInitializer
from app.utils.logger_utils import logger
# 创建初始化工具实例
initializer = AppInitializer(base_dir=".", logger=logger)


if __name__ == "__main__":
    initializer.initialize()
    port = YamlConfig(CONFIG_FILE).get("server.port")
    uvicorn.run("app.fast.fast_app:server_app", host="127.0.0.1", port=port, reload=True)
