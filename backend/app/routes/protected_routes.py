from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.users import User

router = APIRouter(prefix="/protected", tags=["Protected"])


@router.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }