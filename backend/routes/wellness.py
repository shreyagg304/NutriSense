from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import pickle
import os

from db import get_db
from schemas import WellnessIn, WellnessOut
from auth_utils import get_current_user

router = APIRouter(prefix="/api", tags=["Wellness"])

# --------------------------------------------------------
# Load ML models
# --------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_SCORE = os.path.join(BASE_DIR, "../wellness_score_model.pkl")
MODEL_CLASS = os.path.join(BASE_DIR, "../wellness_classifier.pkl")

try:
    score_model = pickle.load(open(MODEL_SCORE, "rb"))
    classifier_model = pickle.load(open(MODEL_CLASS, "rb"))
except:
    print("❌ ERROR: Could not load wellness models")
    score_model = None
    classifier_model = None


# --------------------------------------------------------
# Feature Engineering
# --------------------------------------------------------
healthy_foods = ["banana", "milk", "oats", "dal", "roti", "sabzi",
                 "fruit salad", "egg", "sprouts", "khichdi", "curd"]

unhealthy_foods = ["chips", "pizza", "burger", "fries", "chocolate",
                   "ice cream", "noodles", "samosa", "pakoda"]

mood_map = {"happy": 2, "neutral": 1, "sad": 0, "stressed": -1, "angry": -2}

def score_food(text):
    content = str(text).lower()
    score = 0
    score += sum(w in content for w in healthy_foods) * 2
    score -= sum(w in content for w in unhealthy_foods) * 2
    return score

def convert_to_features(data):
    food_score = (
        score_food(data["breakfast"])
        + score_food(data["lunch"])
        + score_food(data["dinner"])
        + score_food(data["snacks"])
    )

    mood_val = mood_map.get(str(data["mood"]).lower(), 0)
    disease_flag = 0 if data["disease"].lower() == "none" else 1

    features = [
        data["age"],
        data["height_cm"],
        disease_flag,
        food_score,
        data["sleep_hours"],
        data["exercise_hours"],
        data["water_intake_liters"],
        mood_val,
    ]

    return features


# --------------------------------------------------------
# Recommendation Engine
# --------------------------------------------------------
def generate_recommendations(score, label):
    recs = []

    if score < 50:
        recs.append("Improve sleep and aim for 7–8 hours daily.")
        recs.append("Increase water intake and reduce junk food.")
        recs.append("Add fruits/vegetables to meals regularly.")
    elif score < 75:
        recs.append("Maintain balanced meals and drink more water.")
        recs.append("Try light exercise daily.")
    else:
        recs.append("Great wellness score! Maintain current routine.")
        recs.append("Continue hydration and good sleep habits.")

    if label == "Poor":
        recs.append("Consider a pediatric checkup if wellness stays low.")
    if label == "Moderate":
        recs.append("Monitor lifestyle habits for the next week.")

    return recs



# --------------------------------------------------------
# POST /api/wellness  → Predict wellness + Save to DB
# --------------------------------------------------------
@router.post("/wellness", response_model=WellnessOut)
async def wellness_predict(body: WellnessIn, current=Depends(get_current_user)):
    if not score_model or not classifier_model:
        raise HTTPException(status_code=500, detail="Wellness model not loaded")

    db = get_db()

    data = body.dict()
    features = convert_to_features(data)

    score = float(score_model.predict([features])[0])
    label = classifier_model.predict([features])[0]
    recs = generate_recommendations(score, label)

    doc = {
        "user_id": current["id"],
        "input": data,
        "output": {
            "wellness_score": score,
            "prediction": label,
            "recommendations": recs,
        },
        "created_at": datetime.now(timezone.utc),
    }

    await db.wellness_history.insert_one(doc)

    return WellnessOut(
        wellness_score=score,
        prediction=label,
        recommendations=recs,
        created_at=doc["created_at"],
    )


# --------------------------------------------------------
# GET /api/wellness/history  → User wellness logs
# --------------------------------------------------------
@router.get("/wellness/history")
async def wellness_history(current=Depends(get_current_user)):
    db = get_db()
    cursor = db.wellness_history.find({"user_id": current["id"]}).sort("created_at", -1)

    items = []
    async for doc in cursor:
        items.append({
            "id": str(doc["_id"]),
            "created_at": doc["created_at"],
            "wellness_score": doc["output"]["wellness_score"],
            "prediction": doc["output"]["prediction"],
            "recommendations": doc["output"]["recommendations"]
        })

    return {"items": items}
