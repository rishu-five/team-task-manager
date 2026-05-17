from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.repositories import user as crud_user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return crud_user.get_by_email(db, email=email)

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return crud_user.get_multi(db, skip=skip, limit=limit)

def get_user(db: Session, user_id: int) -> Optional[User]:
    return crud_user.get(db, id=user_id)

def create_user(db: Session, user_in: UserCreate, created_by_id: Optional[int] = None) -> Optional[User]:
    user = get_user_by_email(db, email=user_in.email)
    if user:
        return None
    
    user_data = user_in.model_dump()
    
    # Map user_type to database role column (supporting super_admin, admin, member)
    user_type = user_data.get("user_type", "member")
    if user_type == "super_admin":
        user_data["role"] = RoleEnum.super_admin
    elif user_type == "admin":
        user_data["role"] = RoleEnum.admin
    else:
        user_data["role"] = RoleEnum.member
        
    if "user_type" in user_data:
        del user_data["user_type"]
        
    user_data["hashed_password"] = get_password_hash(user_in.password)
    del user_data["password"]
    
    if created_by_id:
        user_data["created_by_id"] = created_by_id

    # Since CRUDUser expects UserCreate, but we have hashed_password
    # Let's just create it directly via dict
    db_obj = User(**user_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    return crud_user.update(db, db_obj=db_user, obj_in=update_data)

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if user.is_active == 0:
        return None
    return user

def update_user_password(db: Session, user: User, new_password: str) -> User:
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
