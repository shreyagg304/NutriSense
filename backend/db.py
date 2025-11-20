import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "nutrisense")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

users_collection = db["users"]
histories_collection = db["histories"]
wellness_collection = db["wellness_logs"]

def get_db():
    return db