from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user import User

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    total_cost_approved: Optional[int] = 0
    cost_used: Optional[int] = 0
    budget: Optional[int] = 0
    client_name: Optional[str] = None
    project_code: Optional[str] = None
    start_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    status: Optional[str] = "Active"
    rewards_enabled: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_cost_approved: Optional[int] = None
    cost_used: Optional[int] = None
    budget: Optional[int] = None
    client_name: Optional[str] = None
    project_code: Optional[str] = None
    start_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    status: Optional[str] = None
    rewards_enabled: Optional[bool] = None

class ProjectInDBBase(ProjectBase):
    id: int
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    pass

class ProjectWithMembers(Project):
    members: List[User] = []
