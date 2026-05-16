from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.task import TaskStatus
from app.schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate, TaskWithDetails, TaskComment, TaskCommentCreate
from app.services import task as task_service
from app.services import project as project_service
from app.services import dashboard as dashboard_service

router = APIRouter()

@router.post("/", response_model=TaskSchema)
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_user),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Create new task.
    """
    project = project_service.get_project(db=db, project_id=task_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role.value != "admin" and current_user not in project.members:
        raise HTTPException(status_code=403, detail="You must be a member of this project to create tasks")

    task = task_service.create_task(db=db, task_in=task_in, creator_id=current_user.id)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return task

@router.get("/", response_model=List[TaskWithDetails])
def read_tasks(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tasks.
    """
    return task_service.get_tasks(db=db, user_id=current_user.id, project_id=project_id, status=status, skip=skip, limit=limit)

@router.put("/{id}", response_model=TaskSchema)
def update_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(deps.get_current_user),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Update a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = project_service.get_project(db=db, project_id=task.project_id)
    if current_user not in project.members and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if current_user.role.value != "admin":
        # Check if member is modifying restricted fields
        update_dict = task_in.model_dump(exclude_unset=True)
        allowed_keys = {"status"}
        if any(key not in allowed_keys for key in update_dict.keys()):
            raise HTTPException(status_code=403, detail="Members can only update task status")

    # Let's populate project dictionary so frontend has rewards_enabled flag
    updated_task = task_service.update_task(db=db, db_task=task, task_in=task_in)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return updated_task

@router.post("/{id}/comments", response_model=TaskComment)
def create_task_comment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    comment_in: TaskCommentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a comment to a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = project_service.get_project(db=db, project_id=task.project_id)
    if current_user not in project.members and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return task_service.create_comment(db=db, task_id=id, user_id=current_user.id, comment_in=comment_in)

@router.get("/{id}/comments", response_model=List[TaskComment])
def read_task_comments(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get comments for a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = project_service.get_project(db=db, project_id=task.project_id)
    if current_user not in project.members and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return task_service.get_comments(db=db, task_id=id)

@router.delete("/{id}", response_model=TaskSchema)
def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
    redis_client = Depends(deps.get_redis_client)
) -> Any:
    """
    Delete a task.
    """
    task = task_service.get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = project_service.get_project(db=db, project_id=task.project_id)
    if current_user not in project.members and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deleted_task = task_service.delete_task(db=db, task_id=id)
    dashboard_service.invalidate_dashboard_cache(redis_client)
    return deleted_task
