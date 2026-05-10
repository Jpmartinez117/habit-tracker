from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.habit_log_model import HabitLog
from app.models.habit_model import Habit
from app.models.mood_log_model import MoodLog


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
    if total_days == 0:
        return 0.0
    return round(completed / total_days * 100, 1)

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

def build_daily_breakdown(logs_by_date: dict, start: date, end: date, active_dates: set, today: date) -> list:
    breakdown = []
    cursor = start
    while cursor <= end:
        if cursor in logs_by_date:
            breakdown.append({"date": cursor.isoformat(), "status": logs_by_date[cursor]})
        elif cursor in active_dates and cursor < today:
            breakdown.append({"date": cursor.isoformat(), "status": "missed"})
        else:
            breakdown.append({"date": cursor.isoformat(), "status": "not_logged"})
        cursor += timedelta(days=1)
    return breakdown

def get_habit_summary(db: Session, habit_id: int, user_id: int, target_month: Optional[str] = None) -> dict:
    habit = get_habit_for_user(db, habit_id, user_id)
    if not habit:
        return None

    today = date.today()
    created_date = habit.created_at.date()

    if target_month:
        year, mon = target_month.split('-')
        month_start = date(int(year), int(mon), 1)
    else:
        month_start = today.replace(day=1)

    # Last day of the target month, capped at today
    month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    window_end = min(month_end, today)
    window_start = max(created_date, month_start)

    # All-time logs (creation → today): used for stats and streak
    all_logs = get_logs_in_window(db, habit_id, created_date, today)
    all_logs_by_date = {log.log_date: log.status for log in all_logs}

    # 14-day window: used for rolling week percentages
    stats_start = today - timedelta(days=13)
    stats_logs = get_logs_in_window(db, habit_id, stats_start, today)
    stats_logs_by_date = {log.log_date: log.status for log in stats_logs}

    # Breakdown window: month window (or creation date) → window_end
    breakdown_by_date = {d: s for d, s in all_logs_by_date.items() if window_start <= d <= window_end}

    # Dates where the user logged *any* habit — used to distinguish missed vs not_logged
    active_dates = set(
        row.log_date for row in db.query(HabitLog.log_date)
        .join(Habit, HabitLog.habit_id == Habit.id)
        .filter(
            Habit.user_id == user_id,
            HabitLog.log_date >= window_start,
            HabitLog.log_date <= today
        )
        .distinct()
        .all()
    )

    days_since_created = (today - created_date).days + 1
    total_completed = sum(1 for s in all_logs_by_date.values() if s == "completed")
    total_missed = days_since_created - total_completed
    completion_pct = calc_completion_percentage(total_completed, days_since_created)
    this_week_pct, last_week_pct, week_change = calc_week_percentages(stats_logs_by_date, today)
    current_streak = calc_current_streak(all_logs_by_date, today)
    daily_breakdown = build_daily_breakdown(breakdown_by_date, window_start, window_end, active_dates, today)

    return {
        "habit_id": habit.id,
        "habit_name": habit.name,
        "frequency": habit.frequency,
        "is_archived": habit.is_archived,
        "month": month_start.strftime("%Y-%m"),
        "days_since_created": days_since_created,
        "total_completed": total_completed,
        "total_missed": total_missed,
        "completion_percentage": completion_pct,
        "this_week_percentage": this_week_pct,
        "last_week_percentage": last_week_pct,
        "week_change": week_change,
        "current_streak": current_streak,
        "daily_breakdown": daily_breakdown
    }


def get_overall_summary(db: Session, user_id: int, target_month: Optional[str] = None) -> dict:
    today = date.today()

    if target_month:
        year, mon = target_month.split('-')
        month_start = date(int(year), int(mon), 1)
    else:
        month_start = today.replace(day=1)

    month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    window_end = min(month_end, today)
    is_current_month = month_start == today.replace(day=1)

    # All habits ever created for this user (including archived, all frequencies).
    # The Logging page lets the user toggle any active habit, so the overall heatmap
    # mirrors every habit they can save. Archived habits still count for days they
    # were active in the past — those logs are real history. The top-level "Active
    # Goals" metric uses only currently non-archived habits.
    all_habits = (
        db.query(Habit)
        .filter(Habit.user_id == user_id)
        .all()
    )
    all_habit_ids = [h.id for h in all_habits]
    habit_created_dates = [h.created_at.date() for h in all_habits]
    current_habit_count = sum(1 for h in all_habits if not h.is_archived)

    def active_count_on(d: date) -> int:
        return sum(1 for cd in habit_created_dates if cd <= d)

    # Month logs across all habits (including ones now archived)
    month_logs = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id.in_(all_habit_ids),
            HabitLog.log_date >= month_start,
            HabitLog.log_date <= window_end,
        )
        .all()
    ) if all_habit_ids else []

    completed_by_date: dict = {}
    for log in month_logs:
        if log.status == "completed":
            completed_by_date[log.log_date] = completed_by_date.get(log.log_date, 0) + 1

    # Build daily_breakdown — denominator per day reflects how many daily habits
    # were already created by that date.
    daily_breakdown = []
    cursor = month_start
    while cursor <= window_end:
        active_count = active_count_on(cursor)
        completed = completed_by_date.get(cursor, 0)
        pct = round(completed / active_count * 100, 1) if active_count > 0 else 0.0
        daily_breakdown.append({
            "date": cursor.isoformat(),
            "completed": completed,
            "total_daily_habits": active_count,
            "percentage": pct,
        })
        cursor += timedelta(days=1)

    total_completed = sum(d["completed"] for d in daily_breakdown)
    total_possible = sum(d["total_daily_habits"] for d in daily_breakdown)
    total_missed = total_possible - total_completed
    completion_pct = calc_completion_percentage(total_completed, total_possible)

    # Week percentages: only for current month
    this_week_pct = None
    last_week_pct = None
    week_change = None

    if is_current_month:
        stats_start = today - timedelta(days=13)
        week_logs = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id.in_(all_habit_ids),
                HabitLog.log_date >= stats_start,
                HabitLog.log_date <= today,
            )
            .all()
        ) if all_habit_ids else []

        week_completed_by_date: dict = {}
        for log in week_logs:
            if log.status == "completed":
                week_completed_by_date[log.log_date] = week_completed_by_date.get(log.log_date, 0) + 1

        this_week_start = today - timedelta(days=6)
        this_week_completed = sum(
            count for d, count in week_completed_by_date.items()
            if this_week_start <= d <= today
        )
        this_week_denominator = sum(
            active_count_on(this_week_start + timedelta(days=i)) for i in range(7)
        )
        this_week_pct = round(this_week_completed / this_week_denominator * 100, 1) if this_week_denominator > 0 else 0.0

        last_week_end = today - timedelta(days=7)
        last_week_start = today - timedelta(days=13)
        last_week_completed = sum(
            count for d, count in week_completed_by_date.items()
            if last_week_start <= d <= last_week_end
        )
        last_week_denominator = sum(
            active_count_on(last_week_start + timedelta(days=i)) for i in range(7)
        )
        last_week_pct = round(last_week_completed / last_week_denominator * 100, 1) if last_week_denominator > 0 else 0.0

        week_change = round(this_week_pct - last_week_pct, 1)

    # Average mood for target month
    mood_logs = (
        db.query(MoodLog)
        .filter(
            MoodLog.user_id == user_id,
            MoodLog.log_date >= month_start,
            MoodLog.log_date <= window_end,
        )
        .all()
    )
    average_mood = (
        round(sum(m.mood_score for m in mood_logs) / len(mood_logs), 1)
        if mood_logs else None
    )

    return {
        "month": month_start.strftime("%Y-%m"),
        "daily_habit_count": current_habit_count,
        "total_completed": total_completed,
        "total_missed": total_missed,
        "completion_percentage": completion_pct,
        "this_week_percentage": this_week_pct,
        "last_week_percentage": last_week_pct,
        "week_change": week_change,
        "average_mood": average_mood,
        "daily_breakdown": daily_breakdown,
    }