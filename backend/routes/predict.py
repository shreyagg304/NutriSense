from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import pandas as pd
import joblib
from db import get_db
from schemas import PredictIn, PredictOut, HistoryList, HistoryItem
from auth_utils import get_current_user

router = APIRouter(prefix="/api", tags=["Prediction"])

def get_recommendation(nutrition_status: str, food_category: str, age: int, gender: str) -> str:
    ns = nutrition_status.lower()
    fc = food_category.lower()
    rules = {
        ("stunted", "healthy"): "Add calorie-dense foods like ghee, bananas, peanut butter along with healthy diet.",
        ("stunted", "balanced"): "Increase protein intake: add eggs, dals, paneer, soya, milk 2 times a day.",
        ("stunted", "junk"): "Avoid junk. Replace with protein-rich foods like eggs, lentils, milk & sprouts.",
        ("normal", "healthy"): "Maintain current diet, add seasonal fruits & nuts for micronutrients.",
        ("normal", "balanced"): "Good diet. Add more fiber (fruits/vegetables) for long-term health.",
        ("normal", "junk"): "Reduce junk. Replace with home-made snacks like upma, poha, fruit salad.",
        ("tall", "healthy"): "Maintain height growth by including calcium foods like milk, ragi & paneer.",
        ("tall", "balanced"): "Balanced diet is good. Ensure physical activity + good sleep.",
        ("tall", "junk"): "Junk food may affect metabolism. Replace with coconut water, fruits, boiled corn.",
    }
    return rules.get((ns, fc), "General Tip: Ensure 3 meals + 2 healthy snacks daily, include fruits, protein & hydration.")

@router.post("/predict", response_model=PredictOut)
async def predict(body: PredictIn, current=Depends(get_current_user)):
    db = get_db()
    from fastapi import Request
    
    import main
    model1 = main.model1
    model2 = main.model2
    vectorizer = main.vectorizer
    enc1 = main.enc1
    enc2 = main.enc2

    # Model 1
    df = pd.DataFrame([[body.age, 0 if body.gender == "male" else 1, body.height]],
                      columns=["Age (in months)", "Gender", "Height (cm)"])
    pred1 = enc1.inverse_transform(model1.predict(df))[0]

    # Model 2
    x_vec = vectorizer.transform([body.food_text])
    pred2 = enc2.inverse_transform(model2.predict(x_vec))[0]

    # Recommendation
    reco = get_recommendation(pred1, pred2, body.age, body.gender)

    payload = {
        "nutrition_status": pred1,
        "food_category": pred2,
        "recommendation": reco
    }

    # Save history
    await db.histories.insert_one({
        "user_id": current["id"],
        "input": body.model_dump(),
        "output": payload,
        "created_at": datetime.now(timezone.utc),
    })

    return payload

@router.get("/history", response_model=HistoryList)
async def my_history(current=Depends(get_current_user)):
    db = get_db()
    cursor = db.histories.find({"user_id": current["id"]}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        items.append(HistoryItem(
            id=str(doc["_id"]),
            created_at=doc["created_at"],
            input=doc["input"],
            output=doc["output"]
        ))
    return {"items": items}
