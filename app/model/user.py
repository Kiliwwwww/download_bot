from peewee import *

from db.db_manager import DBManager

User = DBManager.model("users", {
    "id": IntegerField(),
    "name": CharField()
})