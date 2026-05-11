"""
Creates all tables defined by the SQLAlchemy models.

Run this once after init_db.sql has created the `habit_tracker` database.

Usage (from the backend/ directory, with the venv activated):
    python create_tables.py
"""
from app.core.database import Base, engine
from app.models.users import User  # noqa: F401
from app.models.habit_model import Habit  # noqa: F401
from app.models.habit_log_model import HabitLog  # noqa: F401
from app.models.mood_log_model import MoodLog  # noqa: F401

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")
