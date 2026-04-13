from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum
from typing import List, Optional


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

class DailyHabitBreakdown(BaseModel):
    date: date
    logged: bool
    status: Optional[str]


class HabitSummaryResponse(BaseModel):
    habit_id: int
    habit_name: str
    frequency: str
    is_archived: bool
    days: int
    total_logged: int
    total_completed: int
    total_missed: int
    completion_percentage: float
    this_week_percentage: float
    last_week_percentage: float
    week_change: float
    current_streak: int
    daily_breakdown: List[DailyHabitBreakdown]