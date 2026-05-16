from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority, TaskType
from app.schemas.user import User
from app.schemas.project import Project as ProjectSchema
from typing import List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.medium
    task_type: TaskType = TaskType.task
    story_points: int = 0
    due_date: Optional[datetime] = None
    project_id: int

class TaskCreate(TaskBase):
    assigned_to_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    task_type: Optional[TaskType] = None
    story_points: Optional[int] = None
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[int] = None
    is_reviewed: Optional[bool] = None
    reward_points: Optional[int] = None

class TaskInDBBase(TaskBase):
    id: int
    created_at: datetime
    assigned_to_id: Optional[int] = None
    created_by_id: Optional[int] = None
    key_index: Optional[int] = None
    task_key: Optional[str] = None
    is_reviewed: bool = False
    reward_points: int = 0

    class Config:
        from_attributes = True

class Task(TaskInDBBase):
    pass

class TaskCommentBase(BaseModel):
    content: str

class TaskCommentCreate(TaskCommentBase):
    pass

class TaskComment(TaskCommentBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True

class TaskWithDetails(Task):
    assigned_to: Optional[User] = None
    created_by: Optional[User] = None
    project: Optional[ProjectSchema] = None
    comments: List[TaskComment] = []
