import yaml

with open("config/config.yml") as f:
    config = yaml.safe_load(f)

print(f'export WEB_PORT={config["server"]["port"]}')
print(f'export REDIS_URL={config["server"]["redis"]}')
print(f'export DASHBOARD_PORT={config["server"]["dashboard_port"]}')
