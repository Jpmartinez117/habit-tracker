from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class frequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"

class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    frequency: Optional[frequencyEnum] = None
    target_count: Optional[int] = None

class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    frequency: frequencyEnum
    target_count: int

class HabitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    frequency: str
    is_archived: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }