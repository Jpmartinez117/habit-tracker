from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.user_schema import UserResponse
from app.services.auth_service import login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(
    response: Response,
    # OAuth2PasswordRequestForm is a FastAPI built-in that expects an
    # application/x-www-form-urlencoded body with fields "username" and "password".
    # We use the "username" field to carry the user's email address — the field
    # name is a framework requirement, not a design choice.
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    access_token = login_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
