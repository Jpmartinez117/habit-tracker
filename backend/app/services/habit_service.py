from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.habit_model import Habit
from app.schemas.habit import HabitCreate, HabitUpdate

def create_habit(db: Session, habit_data: HabitCreate, user_id: int) -> Habit:
    # Only check for name conflicts among active (non-archived) habits.
    # A user can re-create a habit with the same name after archiving the original.
    existing = (
        db.query(Habit)
        .filter(Habit.user_id == user_id, Habit.name == habit_data.name.strip(), Habit.is_archived == False)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An active goal with this name already exists")

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

def get_archived_habits(db: Session, user_id: int):
    return (
        db.query(Habit)
        .filter(Habit.user_id == user_id, Habit.is_archived == True)
        .all()
        )

def update_habit(db: Session, habit_id: int, user_id: int, habit_data: HabitUpdate) -> Habit:
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id, Habit.is_archived == False)
        .first()
    )

    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    updates = habit_data.model_dump(exclude_unset=True)

    # If the name is being changed, enforce the same uniqueness rule as create.
    if "name" in updates:
        new_name = updates["name"].strip()
        updates["name"] = new_name
        conflict = (
            db.query(Habit)
            .filter(
                Habit.user_id == user_id,
                Habit.name == new_name,
                Habit.is_archived == False,
                Habit.id != habit_id,
            )
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An active goal with this name already exists",
            )

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    habit.is_archived = True
    db.commit()
    db.refresh(habit)
    return habit

def restore_habit(db: Session, habit_id: int, user_id: int) -> Habit:
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id, Habit.is_archived == True)
        .first()
    )

    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    habit.is_archived = False
    db.commit()
    db.refresh(habit)
    return habit