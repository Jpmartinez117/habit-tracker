from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine

app = FastAPI(
    title = "Habit Tracker API",
    description = "API for managing habits and tracking progress",
    version = "1.0.0",
    docs_url = "/docs",
    redoc_url = "/redoc",
)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Habit Tracker API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}