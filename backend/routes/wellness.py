from fastapi import APIRouter, Depends, HTTPException
from schemas import WellnessInput
from auth_utils import get_current_user
import joblib
import numpy as np
from db import wellness_collection
from datetime import datetime
import pytz

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
        data.breakfast + " " +
        data.lunch + " " +
        data.dinner + " " +
        data.snacks
    ).lower()

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
        food_score
    ]


def generate_recommendations(data: WellnessInput, score, category):
    recs = []

    all_food = (
        data.breakfast + " " + data.lunch + " " +
        data.dinner + " " + data.snacks
    ).lower()

    if any(j in all_food for j in junk_keywords):
        recs.append("Reduce junk foods like pizza, chips and fried snacks.")

    if not any(h in all_food for h in healthy_keywords):
        recs.append("Include more vegetables, dal, fruits and whole grains.")

    if data.water_intake_liters < 1:
        recs.append("Increase water intake to at least 1.5–2 liters daily.")

    if data.sleep_hours < 7:
        recs.append("Try to get at least 7–9 hours of sleep daily.")

    if data.exercise_hours < 0.5:
        recs.append("Do at least 30 minutes of physical activity daily.")

    if data.mood.lower() in ["sad", "stressed", "angry"]:
        recs.append("Try meditation, deep breathing or stress-relief activities.")

    d = data.disease.lower()
    if d == "diabetes":
        recs.append("Avoid sweets and sugary foods. Prefer low-glycemic meals.")
    if d == "anemia":
        recs.append("Add iron-rich foods like spinach, beetroot and jaggery.")
    if d == "asthma":
        recs.append("Avoid cold foods and include warm soups and fluids.")
    if d == "diarrhea":
        recs.append("Take ORS and eat light foods like banana, curd or khichdi.")
    if d == "cold":
        recs.append("Consume warm fluids, soups, and vitamin C-rich foods.")

    if score < 30:
        recs.append("Your wellness score is low. Improve diet and sleep routines.")
    elif score < 60:
        recs.append("You're doing okay! Try to be more consistent with habits.")
    else:
        recs.append("Excellent! Maintain your healthy routine.")

    if len(recs) < 3:
        recs.append("Maintain balanced meals every day.")
        recs.append("Stay hydrated throughout the day.")

    return recs


@router.post("/predict")
async def predict_wellness(data: WellnessInput, user=Depends(get_current_user)):

    features = np.array(convert_to_features(data)).reshape(1, -1)
    score = float(score_model.predict(features)[0])

    def wellness_category(score):
        if score >= 50:
            return "Healthy"
        elif score >= 40:
            return "Moderate"
        return "Poor"

    category = wellness_category(score)
    recommendations = generate_recommendations(data, score, category)

    # ⭐ Always get today's India date if user does NOT give date
    ist = pytz.timezone("Asia/Kolkata")

    if data.date:
        try:
            created_at = datetime.strptime(data.date, "%Y-%m-%d").replace(tzinfo=ist)
        except:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    else:
        created_at = datetime.now(ist)

    entry = {
        "user_id": str(user["id"]),
        "input": data.dict(),
        "score": round(score, 2),
        "category": category,
        "recommendations": recommendations,
        "created_at": created_at
    }

    await wellness_collection.insert_one(entry)

    return {
        "wellness_score": round(score, 2),
        "prediction": category,
        "recommendations": recommendations
    }


@router.get("/history")
async def get_history(user=Depends(get_current_user)):
    records = await wellness_collection.find(
        {"user_id": str(user["id"])}
    ).sort("created_at", -1).to_list(None)

    for r in records:
        r["_id"] = str(r["_id"])

    return records
