from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.habit import HabitCreate, HabitResponse
from app.services.habit_service import create_habit, get_user_habits, archive_habit

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_new_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_habit(db=db, habit_data=habit_data, user_id=current_user.id)

@router.get("", response_model=List[HabitResponse])
def get_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_habits(db=db, user_id=current_user.id)

@router.patch("/{habit_id}/archive", response_model=HabitResponse)
def archive_habit_route(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return archive_habit(db=db, habit_id=habit_id, user_id=current_user.id)