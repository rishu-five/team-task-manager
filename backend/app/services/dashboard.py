import json
import redis
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from app.models.project import Project
from app.models.task import Task, TaskStatus
from app.models.user import User

def get_dashboard_stats(db: Session, redis_client: redis.Redis, user: User, project_id: Optional[int] = None) -> Dict[str, Any]:
    cache_key = f"dashboard:stats:user:{user.id}:project:{project_id or 'all'}"
    cached_stats = redis_client.get(cache_key)
    
    if cached_stats:
        return json.loads(cached_stats)
    
    # Admins see all projects, members see only their assigned projects
    if user.role == "admin":
        user_projects = db.query(Project).all()
    else:
        user_projects = db.query(Project).filter(Project.members.any(id=user.id)).all()
        
    project_ids = [p.id for p in user_projects]
    
    if project_id:
        if project_id not in project_ids:
            return {
                "total_projects": 0,
                "total_tasks": 0,
                "completed_tasks": 0,
                "overdue_tasks": 0,
                "tasks_by_status": {"todo": 0, "in_progress": 0, "done": 0},
                "tasks_by_priority": {"Low": 0, "Medium": 0, "High": 0}
            }
        project_ids = [project_id]
        
    if not project_ids:
        stats = {
            "total_projects": 0,
            "total_tasks": 0,
            "completed_tasks": 0,
            "overdue_tasks": 0,
            "tasks_by_status": {"todo": 0, "in_progress": 0, "done": 0},
            "tasks_by_priority": {"Low": 0, "Medium": 0, "High": 0}
        }
        redis_client.setex(cache_key, 300, json.dumps(stats))
        return stats
        
    total_projects = len(project_ids)
    
    total_tasks = db.query(func.count(Task.id)).filter(Task.project_id.in_(project_ids)).scalar()
    completed_tasks = db.query(func.count(Task.id)).filter(Task.project_id.in_(project_ids), Task.status == TaskStatus.done).scalar()
    
    now = datetime.now(timezone.utc)
    overdue_tasks = db.query(func.count(Task.id)).filter(
        Task.project_id.in_(project_ids), 
        Task.status != TaskStatus.done,
        Task.due_date < now
    ).scalar()
    
    tasks_by_status_query = db.query(Task.status, func.count(Task.id)).filter(
        Task.project_id.in_(project_ids)
    ).group_by(Task.status).all()
    
    tasks_by_status = {"todo": 0, "in_progress": 0, "done": 0}
    for status, count in tasks_by_status_query:
        tasks_by_status[status.value] = count
        
    tasks_by_priority_query = db.query(Task.priority, func.count(Task.id)).filter(
        Task.project_id.in_(project_ids)
    ).group_by(Task.priority).all()
    
    tasks_by_priority = {"Low": 0, "Medium": 0, "High": 0}
    for priority, count in tasks_by_priority_query:
        tasks_by_priority[priority.value] = count

    stats = {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks,
        "tasks_by_status": tasks_by_status,
        "tasks_by_priority": tasks_by_priority
    }
    
    redis_client.setex(cache_key, 5, json.dumps(stats)) # 5 seconds for real-time feel
    return stats

def invalidate_dashboard_cache(redis_client: redis.Redis, user_id: Optional[int] = None, project_id: Optional[int] = None):
    """
    Invalidate dashboard cache for specific user or project.
    If project_id is provided, we should ideally invalidate for all users in that project.
    For now, let's just flush all dashboard keys to keep it simple and truly 'real-time'.
    """
    keys = redis_client.keys("dashboard:stats:*")
    if keys:
        redis_client.delete(*keys)
