from fastapi import APIRouter, Depends, HTTPException
from schemas import WellnessInput
from auth_utils import get_current_user
import joblib
import numpy as np
from db import wellness_collection
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/wellness", tags=["Wellness"])

score_model = joblib.load("wellness_score_model.pkl")
class_model = joblib.load("wellness_classifier.pkl")

healthy_keywords = [
    "dal", "roti", "sabzi", "milk", "oats", "banana", "fruit",
    "salad", "egg", "sprouts", "curd", "khichdi", "vegetable"
]

junk_keywords = [
    "pizza", "burger", "fries", "chips", "momos", "cake", "pastry",
    "chocolate", "samosa", "fried", "bhature", "noodles"
]

sugar_keywords = [
    "mango", "cake", "pastry", "sweets", "dessert", "chocolate", "ice cream"
]

disease_penalty = {
    "none": 0,
    "diabetes": 10,
    "asthma": 5,
    "obesity": 8,
    "anemia": 7
}

mood_map = {"happy": 3, "neutral": 0, "sad": -3, "stressed": -5, "angry": -4}

def score_food(text: str):
    text = text.lower()
    score = 0

    for w in healthy_keywords:
        if w in text:
            score += 3

    for w in junk_keywords:
        if w in text:
            score -= 4

    for w in sugar_keywords:
        if w in text:
            score -= 5

    return score


def convert_to_features(data: WellnessInput):
    all_food = (
        data.breakfast + " "
        + data.lunch + " "
        + data.dinner + " "
        + data.snacks
    )

    food_score = score_food(all_food)

    disease_flag = disease_penalty.get(data.disease.lower(), 5)
    mood_val = mood_map.get(data.mood.lower(), 0)

    return [
        data.age,
        data.height_cm,
        float(data.sleep_hours),
        float(data.exercise_hours),
        float(data.water_intake_liters),
        disease_flag,
        mood_val,
        food_score,
    ]

@router.post("/predict")
async def predict_wellness(data: WellnessInput, user=Depends(get_current_user)):

    features = np.array(convert_to_features(data)).reshape(1, -1)

    score = float(score_model.predict(features)[0])
    category = str(class_model.predict(features)[0])

    entry = {
        "user_id": str(user["id"]),
        "input": data.dict(),
        "score": round(score, 2),
        "category": category,
        "created_at": datetime.utcnow().isoformat()
    }

    await wellness_collection.insert_one(entry)

    recommendations = [
        "Maintain balanced meals throughout the day.",
        "Stay hydrated and drink water regularly.",
        "Try including fruits & vegetables in daily meals.",
        "Get proper sleep to improve overall wellness.",
        "Perform 20-30 minutes of physical activity daily."
    ]

    return {
        "wellness_score": round(score, 2),
        "prediction": category,
        "recommendations": recommendations
    }

@router.get("/history")
async def get_history(user=Depends(get_current_user)):
    user_id = str(user["id"])

    records = await wellness_collection.find(
        {"user_id": user["id"]}
    ).sort("created_at", -1).to_list(None)

    for r in records:
        r["_id"] = str(r["_id"])

    return records
