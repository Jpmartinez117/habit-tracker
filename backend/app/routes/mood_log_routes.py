from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.mood_log import MoodLogCreate, MoodLogResponse
from app.services.mood_log_service import log_mood, get_today_mood_log

router = APIRouter(prefix="/mood-logs", tags=["Mood Logs"])


@router.get("/today", response_model=Optional[MoodLogResponse])
def get_today_mood_log_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_today_mood_log(db=db, user_id=current_user.id)


@router.post("", response_model=MoodLogResponse)
def create_mood_log(
    log_data: MoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return log_mood(db=db, log_data=log_data, user_id=current_user.id)
