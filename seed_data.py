"""
uGoal — Seed script

Populates the database with a demo user, sample habits, two weeks of habit logs,
and a handful of mood logs so the app has visible content immediately.

Run this once after backend/create_tables.py has built the schema.

Usage (from the project root, with the backend venv activated):
    python seed_data.py

Demo credentials:
    email:    demo@ugoal.app
    password: demo1234

Idempotent: if the demo user already exists, their habits/logs/moods are wiped
and re-seeded. Other users are left untouched.
"""
import os
import sys
from datetime import date, timedelta

# Make backend/ importable so we can reuse the app's models and security helpers.
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from app.core.database import SessionLocal  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.users import User  # noqa: E402
from app.models.habit_model import Habit  # noqa: E402
from app.models.habit_log_model import HabitLog  # noqa: E402
from app.models.mood_log_model import MoodLog  # noqa: E402


DEMO_EMAIL = "demo@ugoal.app"
DEMO_USERNAME = "demo"
DEMO_PASSWORD = "demo1234"

HABITS = [
    {"name": "Exercise",     "description": "30 minutes of movement"},
    {"name": "Read",         "description": "Read at least 10 pages"},
    {"name": "Meditate",     "description": "10 minutes of mindfulness"},
    {"name": "Drink water",  "description": "Eight glasses of water"},
]

# Per-habit completion pattern for the last 14 days (index 0 = 13 days ago,
# index 13 = today). 1 = completed, 0 = missed. Patterns are varied so the
# heatmap shows a realistic gradient of colors across the month.
COMPLETION_PATTERNS = {
    "Exercise":    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
    "Read":        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    "Meditate":    [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    "Drink water": [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
}

# Mood scores for the last 10 days (index 0 = 9 days ago). Score 1-5.
MOOD_SCORES = [3, 4, 4, 3, 5, 4, 4, 5, 4, 5]
MOOD_LABELS = {1: "Terrible", 2: "Bad", 3: "Okay", 4: "Good", 5: "Excellent"}


def seed() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEMO_EMAIL).first()

        if existing:
            print(f"Demo user '{DEMO_EMAIL}' already exists — wiping their data and re-seeding.")
            db.query(MoodLog).filter(MoodLog.user_id == existing.id).delete()
            # Cascade on Habit deletes HabitLog rows.
            db.query(Habit).filter(Habit.user_id == existing.id).delete()
            db.commit()
            user = existing
        else:
            user = User(
                username=DEMO_USERNAME,
                email=DEMO_EMAIL,
                password_hash=hash_password(DEMO_PASSWORD),
                login_streak=0,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user '{DEMO_EMAIL}'.")

        today = date.today()

        # Create habits
        created_habits: dict[str, Habit] = {}
        for spec in HABITS:
            habit = Habit(
                user_id=user.id,
                name=spec["name"],
                description=spec["description"],
                frequency="daily",
                target_count=1,
                is_archived=False,
            )
            db.add(habit)
            created_habits[spec["name"]] = habit
        db.commit()
        for habit in created_habits.values():
            db.refresh(habit)
        print(f"Created {len(created_habits)} habits.")

        # Create 14 days of habit logs
        log_count = 0
        for habit_name, pattern in COMPLETION_PATTERNS.items():
            habit = created_habits[habit_name]
            for offset, completed in enumerate(pattern):
                log_date = today - timedelta(days=13 - offset)
                if completed:
                    db.add(HabitLog(
                        habit_id=habit.id,
                        log_date=log_date,
                        status="completed",
                        notes=None,
                    ))
                    log_count += 1
        db.commit()
        print(f"Created {log_count} habit log entries across the last 14 days.")

        # Create 10 days of mood logs
        for offset, score in enumerate(MOOD_SCORES):
            log_date = today - timedelta(days=9 - offset)
            db.add(MoodLog(
                user_id=user.id,
                log_date=log_date,
                mood_score=score,
                mood_label=MOOD_LABELS[score],
                notes=None,
            ))
        db.commit()
        print(f"Created {len(MOOD_SCORES)} mood log entries.")

        print()
        print("Seed complete.")
        print(f"  Login with: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
