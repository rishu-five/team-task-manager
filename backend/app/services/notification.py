from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str = "info",
    link: Optional[str] = None
) -> Notification:
    db_obj = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        link=link
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
