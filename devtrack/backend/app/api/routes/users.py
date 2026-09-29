from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.user import PasswordChange, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Profile"])


@router.get("/me", response_model=UserOut, summary="Get my profile")
def get_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserOut, summary="Update my profile")
def update_profile(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> User:
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is None:
        data.pop("name")
    if data.get("email") and data["email"] != current_user.email:
        if db.scalar(select(User).where(User.email == data["email"])):
            raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")
    if "email" in data and data["email"] is None:
        data.pop("email")
    for field, value in data.items():
        setattr(current_user, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")
    return current_user


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT, summary="Change my password")
def change_password(payload: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Response:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
