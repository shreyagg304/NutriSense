from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib

from routes.auth import router as auth_router
from routes.predict import router as predict_router

app = FastAPI(
    title="NutriSense API",
    description="AI-powered child nutrition analysis and food recommendation system",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # replace with your frontend URL 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model1 = joblib.load("model1_growth.pkl")
model2 = joblib.load("model2_food.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")
enc1 = joblib.load("label_encoder_model1.pkl")
enc2 = joblib.load("label_encoder_model2.pkl")

app.include_router(auth_router)
app.include_router(predict_router)

@app.get("/")
def root():
    return {"message": "NutriSense API with Auth is running 🚀"}
