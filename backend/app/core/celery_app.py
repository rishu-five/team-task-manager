import os
from celery import Celery
from app.core.config import settings

# Initialize celery app
celery_app = Celery(
    "team_task_manager",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "app.core.celery_app.send_reminder_email": "main-queue"
}

@celery_app.task
def send_reminder_email(task_id: int, user_email: str):
    """
    Background task to send a reminder email to a user for a specific task.
    """
    # Stub: Integrate actual email sending logic here
    print(f"Sending reminder for task {task_id} to {user_email}")
    return True
