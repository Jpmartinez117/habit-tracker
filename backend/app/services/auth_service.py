from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.users import User
from app.core.security import verify_password, create_access_token


def login_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "username": user.username
        }
    )

    return token