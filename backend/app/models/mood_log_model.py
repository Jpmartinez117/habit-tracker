from sqlalchemy import Column, Integer, Date, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    log_date = Column(Date, nullable=False)
    mood_score = Column(Integer, nullable=False)
    mood_label = Column(String(20))
    notes = Column(String(225))

    created_at = Column(DateTime, server_default=func.now(), nullable=False)