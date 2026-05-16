from app.repositories.base import CRUDBase
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from sqlalchemy.orm import Session
from typing import List

class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    def get_multi_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        return (
            db.query(Project)
            .join(Project.members)
            .filter(User.id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

project = CRUDProject(Project)
