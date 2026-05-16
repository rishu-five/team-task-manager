from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.notification import Notification as NotificationSchema, NotificationUpdate
from app.repositories.notification import notification as notification_repo
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = 20
):
    return notification_repo.get_by_user(db, current_user.id, limit=limit)

@router.put("/{notification_id}/read", response_model=NotificationSchema)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    notification = notification_repo.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    count = notification_repo.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}
