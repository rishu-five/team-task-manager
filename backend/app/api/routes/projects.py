from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.project import Project as ProjectSchema, ProjectCreate, ProjectWithMembers, ProjectUpdate
from app.services import project as project_service
from app.services import user as user_service
from app.services import dashboard as dashboard_service

router = APIRouter()

@router.post("/", response_model=ProjectSchema)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_admin),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Create new project.
    """
    project = project_service.create_project(db=db, project_in=project_in, user_id=current_user.id)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return project

@router.get("/", response_model=List[ProjectWithMembers])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve projects.
    """
    return project_service.get_projects(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{id}", response_model=ProjectWithMembers)
def read_project(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get project by ID.
    """
    project = project_service.get_project(db=db, project_id=id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if current_user not in project.members and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return project

@router.put("/{id}", response_model=ProjectWithMembers)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_admin),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Update project details (Admin only).
    """
    project = project_service.get_project(db=db, project_id=id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    updated_project = project_service.update_project(db=db, project=project, project_in=project_in)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return updated_project

@router.post("/{id}/members/{user_id}", response_model=ProjectWithMembers)
def add_project_member(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    user_id: int,
    current_user: User = Depends(deps.get_current_admin),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Add a member to a project.
    """
    project = project_service.get_project(db=db, project_id=id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_to_add = user_service.get_user(db=db, user_id=user_id)
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
        
    updated_project = project_service.add_member(db=db, project=project, user=user_to_add)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return updated_project
