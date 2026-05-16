from typing import List, Optional
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.repositories import project as crud_project
from app.repositories import user as crud_user

def create_project(db: Session, project_in: ProjectCreate, user_id: int) -> Project:
    project_data = project_in.model_dump()
    project_data["created_by_id"] = user_id
    db_obj = Project(**project_data)
    
    # Creator is a member
    creator = crud_user.get(db, id=user_id)
    if creator:
        db_obj.members.append(creator)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
    user = crud_user.get(db, id=user_id)
    if user and user.role.value == "admin":
        return crud_project.get_multi(db, skip=skip, limit=limit)
    return crud_project.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

def update_project(db: Session, project: Project, project_in: ProjectUpdate) -> Project:
    update_data = project_in.model_dump(exclude_unset=True)
    return crud_project.update(db, db_obj=project, obj_in=update_data)

def get_project(db: Session, project_id: int) -> Optional[Project]:
    return crud_project.get(db, id=project_id)

def add_member(db: Session, project: Project, user: User) -> Project:
    if user not in project.members:
        project.members.append(user)
        db.commit()
        db.refresh(project)
    return project
