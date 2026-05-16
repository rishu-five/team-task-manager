from typing import Any, Optional
# pyrefly: ignore [missing-import]
import redis
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services import dashboard as dashboard_service

router = APIRouter()

@router.get("/")
def get_dashboard_stats(
    project_id: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    redis_client: redis.Redis = Depends(deps.get_redis_client),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get dashboard statistics.
    """
    return dashboard_service.get_dashboard_stats(db, redis_client, current_user, project_id)
