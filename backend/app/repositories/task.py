from app.repositories.base import CRUDBase
from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate
from sqlalchemy.orm import Session
from typing import List, Optional

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, project_id: Optional[int] = None, status: Optional[TaskStatus] = None, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        query = db.query(Task).join(Project).filter(Project.members.any(id=user_id))
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        if status:
            query = query.filter(Task.status == status)
            
        return query.offset(skip).limit(limit).all()

task = CRUDTask(Task)
