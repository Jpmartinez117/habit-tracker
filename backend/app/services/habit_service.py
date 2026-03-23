from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.habit_model import Habit
from app.schemas.habit import HabitCreate, HabitUpdate

def create_habit(db: Session, habit_data: HabitCreate, user_id: int) -> Habit:
    existing = (
        db.query(Habit)
        .filter(Habit.user_id == user_id, Habit.name == habit_data.name.strip(), Habit.is_archived == False)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An active habit with this name already exists")

    new_habit = Habit(
        user_id=user_id,
        name=habit_data.name.strip(),
        description=habit_data.description.strip() if habit_data.description else None,
        frequency=habit_data.frequency.strip().lower(),
    )

    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)

    return new_habit

def get_user_habits(db: Session, user_id: int):
    return (
        db.query(Habit)
        .filter(Habit.user_id == user_id, Habit.is_archived == False)
        .all()
        )

def update_habit(db: Session, habit_id: int, user_id: int, habit_data: HabitUpdate) -> Habit:
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id, Habit.is_archived == False)
        .first()
    )

    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    updates = habit_data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(habit, field, value)

    db.commit()
    db.refresh(habit)
    return habit

def archive_habit(db: Session, habit_id: int, user_id: int) -> Habit:
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id, Habit.is_archived == False)
        .first()
    )

    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    habit.is_archived = True
    db.commit()
    db.refresh(habit)
    return habit