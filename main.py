import uvicorn

from app.utils.yaml_config import YamlConfig, CONFIG_FILE

if __name__ == "__main__":
    port = YamlConfig(CONFIG_FILE).get("server.port")
    print(f"Starting FastAPI on http://127.0.0.1:{port}")
    uvicorn.run("app.fast.fast_app:server_app", host="127.0.0.1", port=port, reload=True)
