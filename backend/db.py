import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "nutrisense")

_client = AsyncIOMotorClient(MONGODB_URI)
_db = _client[DB_NAME]

def get_db():
    return _db

