from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.models.comment import TaskComment
from app.schemas.task import TaskCreate, TaskUpdate, TaskCommentCreate
from app.repositories import task as crud_task
from app.services import notification as notification_service

def create_task(db: Session, task_in: TaskCreate, creator_id: Optional[int] = None) -> Task:
    # Get the latest key_index for this project
    from sqlalchemy import func
    last_task = db.query(Task).filter(Task.project_id == task_in.project_id).order_by(Task.key_index.desc()).first()
    next_index = (last_task.key_index + 1) if last_task and last_task.key_index else 1
    
    db_obj = Task(
        **task_in.model_dump(),
        created_by_id=creator_id,
        key_index=next_index
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Notify assigned user
    if db_obj.assigned_to_id and db_obj.assigned_to_id != creator_id:
        notification_service.create_notification(
            db,
            user_id=db_obj.assigned_to_id,
            title="New Task Assigned",
            message=f"You have been assigned to task: {db_obj.title}",
            type="task_assigned",
            link=f"/tasks"
        )
        
    return db_obj

def get_tasks(
    db: Session, user_id: int, project_id: Optional[int] = None, status: Optional[TaskStatus] = None, skip: int = 0, limit: int = 100
) -> List[Task]:
    user = db.query(User).filter(User.id == user_id).first()
    query = db.query(Task)
    if user and user.role.value == "admin":
        pass
    else:
        from app.models.project import Project
        user_projects = db.query(Project).filter(Project.members.any(id=user_id)).all()
        project_ids = [p.id for p in user_projects]
        query = query.filter(Task.project_id.in_(project_ids))
        
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
        
    return query.offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int) -> Optional[Task]:
    return crud_task.get(db, id=task_id)

def update_task(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
    # Reward points logic
    if task_in.reward_points is not None and db_task.assigned_to_id:
        diff = task_in.reward_points - db_task.reward_points
        if diff != 0:
            user = db.query(User).filter(User.id == db_task.assigned_to_id).first()
            if user:
                user.total_reward_points += diff
                db.add(user)
    
    old_status = db_task.status
    old_assigned_to = db_task.assigned_to_id
    
    updated_task = crud_task.update(db, db_obj=db_task, obj_in=task_in)
    
    # Notify on status change
    if updated_task.status != old_status and updated_task.assigned_to_id:
        notification_service.create_notification(
            db,
            user_id=updated_task.assigned_to_id,
            title="Task Status Updated",
            message=f"Task '{updated_task.title}' status changed to {updated_task.status.value}",
            type="status_change",
            link="/tasks"
        )
        
    # Notify on new assignment
    if updated_task.assigned_to_id != old_assigned_to and updated_task.assigned_to_id:
        notification_service.create_notification(
            db,
            user_id=updated_task.assigned_to_id,
            title="Task Assigned",
            message=f"You have been assigned to task: {updated_task.title}",
            type="task_assigned",
            link="/tasks"
        )
    
    return updated_task

def delete_task(db: Session, task_id: int) -> Task:
    return crud_task.remove(db, id=task_id)

def create_comment(db: Session, task_id: int, user_id: int, comment_in: TaskCommentCreate) -> TaskComment:
    db_obj = TaskComment(
        task_id=task_id,
        user_id=user_id,
        content=comment_in.content
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_comments(db: Session, task_id: int) -> List[TaskComment]:
    return db.query(TaskComment).filter(TaskComment.task_id == task_id).order_by(TaskComment.created_at.asc()).all()
