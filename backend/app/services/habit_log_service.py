from datetime import date
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.habit_log_model import HabitLog
from app.models.habit_model import Habit
from app.schemas.habit_log import HabitLogCreate


def get_today_habit_logs(db: Session, user_id: int) -> List[HabitLog]:
    today = date.today()
    return (
        db.query(HabitLog)
        .join(Habit, HabitLog.habit_id == Habit.id)
        .filter(Habit.user_id == user_id, HabitLog.log_date == today)
        .all()
    )


def log_habit(db: Session, log_data: HabitLogCreate, user_id: int) -> HabitLog:
    habit = (
        db.query(Habit)
        .filter(Habit.id == log_data.habit_id, Habit.user_id == user_id, Habit.is_archived == False)
        .first()
    )

    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    existing = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == log_data.habit_id, HabitLog.log_date == log_data.log_date)
        .first()
    )

    if existing:
        existing.status = log_data.status
        existing.notes = log_data.notes
        db.commit()
        db.refresh(existing)
        return existing

    new_log = HabitLog(
        habit_id=log_data.habit_id,
        log_date=log_data.log_date,
        status=log_data.status,
        notes=log_data.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
