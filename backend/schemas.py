from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class PredictIn(BaseModel):
    age: int = Field(..., ge=0, le=144)     
    gender: str                             
    height: float                          
    food_text: str

class PredictOut(BaseModel):
    nutrition_status: str
    food_category: str
    recommendation: str

class HistoryItem(BaseModel):
    id: str
    created_at: datetime
    input: PredictIn
    output: PredictOut

class HistoryList(BaseModel):
    items: List[HistoryItem]

class WellnessInput(BaseModel):
    age: int
    height_cm: float
    disease: str
    breakfast: str
    lunch: str
    dinner: str
    snacks: str
    sleep_hours: float
    sleep_start: str     
    sleep_end: str      
    exercise_hours: float
    water_intake_liters: float
    mood: str
    notes: str = ""
