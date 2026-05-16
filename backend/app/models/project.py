from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

project_user = Table(
    "project_user",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    
    # Extended fields
    total_cost_approved = Column(Integer, nullable=True, default=0)
    cost_used = Column(Integer, nullable=True, default=0)
    budget = Column(Integer, nullable=True, default=0)
    client_name = Column(String, nullable=True)
    project_code = Column(String, nullable=True, index=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    expected_completion_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="Active", nullable=False)
    rewards_enabled = Column(Boolean, default=False, nullable=False)

    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    created_by = relationship("User")
    members = relationship("User", secondary=project_user, backref="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
