from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
import app.schemas.user
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate
from app.services import user as user_service

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    return user_service.update_user(db=db, db_user=current_user, user_in=user_in)

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Retrieve users. (Admin only)
    """
    return user_service.get_users(db=db, skip=skip, limit=limit)

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: app.schemas.user.UserCreate,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Create new user. (Admin only)
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return user_service.create_user(db=db, user_in=user_in, created_by_id=current_user.id)

@router.put("/{user_id}", response_model=UserSchema)
def update_user_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_admin),
) -> Any:
    """
    Update a user. (Admin only)
    """
    db_user = user_service.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.update_user(db=db, db_user=db_user, user_in=user_in)
