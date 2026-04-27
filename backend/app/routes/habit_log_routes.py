import re
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.habit_log import HabitLogCreate, HabitLogResponse, HabitSummaryResponse, OverallSummaryResponse
from app.services.habit_log_service import log_habit, get_today_habit_logs
from app.services.habit_log_summary_service import get_habit_summary, get_overall_summary

router = APIRouter(prefix="/habit-logs", tags=["Habit Logs"])


@router.get("/today", response_model=List[HabitLogResponse])
def get_today_habit_logs_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_today_habit_logs(db=db, user_id=current_user.id)


@router.post("", response_model=HabitLogResponse)
def create_habit_log(
    log_data: HabitLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return log_habit(db=db, log_data=log_data, user_id=current_user.id)

@router.get("/overall/summary", response_model=OverallSummaryResponse)
def get_overall_summary_route(
    month: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if month is not None:
        if not re.fullmatch(r"\d{4}-\d{2}", month):
            raise HTTPException(status_code=422, detail="month must be in YYYY-MM format")
        today = date.today()
        current_month = today.strftime("%Y-%m")
        if month > current_month:
            raise HTTPException(status_code=422, detail="month cannot be in the future")
    return get_overall_summary(db=db, user_id=current_user.id, target_month=month)


@router.get("/{habit_id}/summary", response_model=HabitSummaryResponse)
def get_habit_summary_route(
    habit_id: int,
    month: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = get_habit_summary(db=db, habit_id=habit_id, user_id=current_user.id, target_month=month)
    if summary is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return summary