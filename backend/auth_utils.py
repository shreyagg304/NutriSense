import os, uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.hash import bcrypt
from dotenv import load_dotenv
from bson import ObjectId
from db import get_db

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

security = HTTPBearer()

def hash_password(pw: str) -> str:
    return bcrypt.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.verify(pw, hashed)

async def create_access_token(user_id: str, email: str, db):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=JWT_EXPIRE_MINUTES)
    jti = str(uuid.uuid4())
    payload = {
        "sub": user_id,
        "email": email,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return token

async def blacklist_token(jti: str, exp_ts: int, db):
    await db.token_blacklist.insert_one({"jti": jti, "exp": exp_ts})

async def is_blacklisted(jti: str, db) -> bool:
    doc = await db.token_blacklist.find_one({"jti": jti})
    return doc is not None

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    db = get_db()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
        jti = payload.get("jti")
        if not user_id or not jti:
            raise HTTPException(status_code=401, detail="Invalid token")
        # check blacklist
        if await is_blacklisted(jti, db):
            raise HTTPException(status_code=401, detail="Token revoked, please login again.")
        # load user
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "token_payload": payload
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
