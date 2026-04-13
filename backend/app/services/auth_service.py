from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date

from app.models.users import User
from app.core.security import verify_password, create_access_token


def login_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    # Update login streak
    today = date.today()
    last_login_date = user.last_login_date

    if last_login_date is None or (today - last_login_date).days > 1:
        user.login_streak = 1 # Streak reset
    elif (today - last_login_date).days == 1: #Exactly 1 day since lasy login
        user.login_streak += 1
    # if last_login_date == Today, no change

    user.last_login_date = today
    db.commit()

    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "username": user.username
        }
    )

    return token