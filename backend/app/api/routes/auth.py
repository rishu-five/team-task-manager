from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import User, UserCreate
from app.services.user import create_user, authenticate_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

# @router.post("/signup", response_model=User)
# def create_user_signup(
#     *,
#     db: Session = Depends(deps.get_db),
#     user_in: UserCreate,
# ) -> Any:
#     """
#     Create new user without the need to be logged in.
#     """
#     user = create_user(db, user_in=user_in)
#     if not user:
#         raise HTTPException(
#             status_code=400,
#             detail="The user with this username already exists in the system.",
#         )
#     return user

import random
import string
from app.schemas.auth import PasswordResetRequest, PasswordResetVerify
from app.services.user import get_user_by_email, update_user_password, authenticate_user
from app.services.email import send_otp_email

@router.post("/password-reset/request")
def request_password_reset(
    *,
    db: Session = Depends(deps.get_db),
    reset_in: PasswordResetRequest,
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Generate and send a 6-digit OTP for password reset.
    """
    user = get_user_by_email(db, email=reset_in.email)
    if not user:
        # We return success anyway to prevent user enumeration
        return {"message": "If an account with that email exists, we have sent an OTP."}
    
    otp = ''.join(random.choices(string.digits, k=6))
    # Store OTP in Redis for 10 minutes
    redis_client.setex(f"otp:{reset_in.email}", 600, otp)
    
    # Send actual email (or mock if not configured)
    send_otp_email(reset_in.email, otp)
    
    return {"message": "OTP sent successfully."}

@router.post("/password-reset/verify")
def verify_password_reset(
    *,
    db: Session = Depends(deps.get_db),
    verify_in: PasswordResetVerify,
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Verify OTP and reset password.
    """
    if verify_in.new_password != verify_in.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    stored_otp = redis_client.get(f"otp:{verify_in.email}")
    if not stored_otp or stored_otp != verify_in.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = get_user_by_email(db, email=verify_in.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_user_password(db, user=user, new_password=verify_in.new_password)
    # Clear OTP after successful reset
    redis_client.delete(f"otp:{verify_in.email}")
    
    return {"message": "Password reset successfully."}
