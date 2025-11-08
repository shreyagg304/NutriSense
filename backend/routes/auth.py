from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from db import get_db
from schemas import SignupIn, LoginIn, TokenOut, UserOut
from auth_utils import hash_password, verify_password, create_access_token, get_current_user, blacklist_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=UserOut)
async def signup(body: SignupIn):
    db = get_db()
    exists = await db.users.find_one({"email": body.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.users.insert_one(doc)
    return {"id": str(res.inserted_id), "name": doc["name"], "email": doc["email"]}

@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn):
    db = get_db()
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = await create_access_token(str(user["_id"]), user["email"], db)
    return {
        "access_token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    return {"id": current["id"], "name": current["name"], "email": current["email"]}

@router.post("/logout")
async def logout(current=Depends(get_current_user)):
    db = get_db()
    payload = current["token_payload"]
    jti = payload.get("jti")
    exp = payload.get("exp")
    await blacklist_token(jti, exp, db)
    return {"message": "Logged out successfully"}
