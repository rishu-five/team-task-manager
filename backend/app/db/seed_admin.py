import os
from app.db.session import SessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate

def seed():
    db = SessionLocal()
    try:
        email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        password = os.getenv("ADMIN_PASSWORD", "admin123")
        full_name = os.getenv("ADMIN_NAME", "System Admin")
        
        print(f"Creating admin user: {email}")
        user = create_user(db, UserCreate(
            email=email, 
            password=password, 
            full_name=full_name, 
            role="admin"
        ))
        print(f"Admin created successfully! ID: {user.id}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
