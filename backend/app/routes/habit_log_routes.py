from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.habit_log import HabitLogCreate, HabitLogResponse
from app.services.habit_log_service import log_habit, get_today_habit_logs

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
