from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine
from .routes.user_routes import router as user_router
from .routes.auth_routes import router as auth_router
from .routes.protected_routes import router as protected_router
from app.routes import habit_routes
from app.routes import habit_log_routes
from app.routes import mood_log_routes

app = FastAPI(
    title="Habit Tracker API",
    description="API for managing habits and tracking progress",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(habit_routes.router)
app.include_router(habit_log_routes.router)
app.include_router(mood_log_routes.router)

@app.get("/")
def root():
    return {"message": "Habit Tracker API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}