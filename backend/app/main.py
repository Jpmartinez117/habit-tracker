from fastapi import FastAPI
from .core.database import engine

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Habit Tracker API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}