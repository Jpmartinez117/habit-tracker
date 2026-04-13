from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.habit_log_model import HabitLog
from app.models.habit_model import Habit


def get_habit_for_user(db: Session, habit_id: int, user_id: int) -> Optional[Habit]:
    return (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id)
        .first()
    )

def get_logs_in_window(db: Session, habit_id: int, start: date, end: date) -> List[HabitLog]:
    return (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= start,
            HabitLog.log_date <= end
            )
        .order_by(HabitLog.log_date.desc())
        .all()
    )

def calc_completion_percentage(completed: int, total_days: int) -> float:
    if total_days ==0:
        return 0.0
    return round(completed / total_days * 100, 2)

def calc_week_percentages(logs_by_date: dict, today: date):
    # This week: Last 7 days, Today inclusive 
    this_week_start = today - timedelta(days=6)
    this_week_completed = sum(
        1 for d, status in logs_by_date.items()
        if this_week_start <= d <= today and status == "completed"
    )
    this_week_pct = round(this_week_completed / 7 * 100, 2)

    # Last week: 7 days before this week
    last_week_end = today - timedelta(days=7)
    last_week_start = today - timedelta(days=13)
    last_week_completed = sum(
        1 for d, status in logs_by_date.items()
        if last_week_start <= d <= last_week_end and status == "completed"
    )
    last_week_pct = round(last_week_completed / 7 * 100, 2)

    week_change = round(this_week_pct - last_week_pct, 2)
    return this_week_pct, last_week_pct, week_change

def calc_current_streak(logs_by_date: dict, today: date) -> int:
    streak = 0
    cursor = today
    while cursor in logs_by_date:
        streak += 1
        cursor -= timedelta(days=1)
    return streak

def build_daily_breakdown(logs_by_date: dict, start: date, end: date) -> list:
    breakdown = []
    cursor = start
    while cursor <= end:
        if cursor in logs_by_date:
            breakdown.append({"date": cursor.isoformat(), "logged": True, "status": logs_by_date[cursor]})
        else:
            breakdown.append({"date": cursor.isoformat(), "logged": False, "status": None})
        cursor += timedelta(days=1)
    return breakdown

def get_habit_summary(db: Session, habit_id: int, user_id: int, days: int) -> dict:
    habit = get_habit_for_user(db, habit_id, user_id)
    if not habit:
        return None
    
    today = date.today()
    start = today - timedelta(days=days-1)

    logs = get_logs_in_window(db, habit_id, start, today)
    logs_by_date = {log.log_date: log.status for log in logs}

    total_logged = len(logs)
    total_completed = sum(1 for status in logs_by_date.values() if status == "completed")
    total_missed = sum(1 for status in logs_by_date.values() if status == "missed")
    completion_pct = calc_completion_percentage(total_completed, days)
    this_week_pct,last_week_pct, week_change = calc_week_percentages(logs_by_date, today)
    current_streak = calc_current_streak(logs_by_date, today)
    daily_breakdown = build_daily_breakdown(logs_by_date, start, today)

    return {
        "habit_id": habit.id,
        "habit_name": habit.name,
        "frequency": habit.frequency,
        "is_archived": habit.is_archived,
        "days": days,
        "total_logged": total_logged,
        "total_completed": total_completed,
        "total_missed": total_missed,
        "completion_percentage": completion_pct,
        "this_week_percentage": this_week_pct,
        "last_week_percentage": last_week_pct,
        "week_change": week_change,
        "current_streak": current_streak,
        "daily_breakdown": daily_breakdown
    }