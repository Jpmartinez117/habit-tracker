from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum
from typing import Optional


class LogStatusEnum(str, Enum):
    completed = "completed"
    missed = "missed"


class HabitLogCreate(BaseModel):
    habit_id: int
    log_date: date
    status: LogStatusEnum
    notes: Optional[str] = None


class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    log_date: date
    status: str
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
