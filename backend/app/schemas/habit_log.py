from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum
from typing import List, Literal, Optional


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
    status: Literal["completed", "missed", "not_logged"]


class DailyOverallBreakdown(BaseModel):
    date: date
    completed: int
    total_daily_habits: int
    percentage: float


class OverallSummaryResponse(BaseModel):
    month: str
    daily_habit_count: int
    total_completed: int
    total_missed: int
    completion_percentage: float
    this_week_percentage: Optional[float]
    last_week_percentage: Optional[float]
    week_change: Optional[float]
    average_mood: Optional[float]
    daily_breakdown: List[DailyOverallBreakdown]


class HabitSummaryResponse(BaseModel):
    habit_id: int
    habit_name: str
    frequency: str
    is_archived: bool
    month: str
    days_since_created: int
    total_completed: int
    total_missed: int
    completion_percentage: float
    this_week_percentage: float
    last_week_percentage: float
    week_change: float
    current_streak: int
    daily_breakdown: List[DailyHabitBreakdown]