from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class MoodLogCreate(BaseModel):
    log_date: date
    mood_score: int = Field(..., ge=1, le=5)
    notes: Optional[str] = None


class MoodLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: date
    mood_score: int
    mood_label: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
