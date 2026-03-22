from sqlalchemy import Column, Integer, Date, Enum, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)

    log_date = Column(Date, nullable=False)
    status = Column(Enum("completed", "missed", "skipped"), nullable=False, default="completed")
    notes = Column(String(225))

    created_at = Column(DateTime, server_default=func.now(), nullable=False)