from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.mood_log_model import MoodLog
from app.schemas.mood_log import MoodLogCreate

MOOD_LABELS = {
    1: "Very Bad",
    2: "Bad",
    3: "Neutral",
    4: "Good",
    5: "Very Good",
}


def get_today_mood_log(db: Session, user_id: int) -> Optional[MoodLog]:
    today = date.today()
    return (
        db.query(MoodLog)
        .filter(MoodLog.user_id == user_id, MoodLog.log_date == today)
        .first()
    )


def log_mood(db: Session, log_data: MoodLogCreate, user_id: int) -> MoodLog:
    mood_label = MOOD_LABELS[log_data.mood_score]

    existing = (
        db.query(MoodLog)
        .filter(MoodLog.user_id == user_id, MoodLog.log_date == log_data.log_date)
        .first()
    )

    if existing:
        existing.mood_score = log_data.mood_score
        existing.mood_label = mood_label
        existing.notes = log_data.notes
        db.commit()
        db.refresh(existing)
        return existing

    new_log = MoodLog(
        user_id=user_id,
        log_date=log_data.log_date,
        mood_score=log_data.mood_score,
        mood_label=mood_label,
        notes=log_data.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
