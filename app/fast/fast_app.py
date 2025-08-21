from fastapi import FastAPI

server_app = FastAPI()


@server_app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@server_app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
