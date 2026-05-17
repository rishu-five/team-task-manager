import os
from app.db.session import SessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate

def seed():
    db = SessionLocal()
    try:
        # 1. Seed Super Admin
        sa_email = os.getenv("SUPERADMIN_EMAIL")
        sa_password = os.getenv("SUPERADMIN_PASSWORD")
        if sa_email and sa_password:
            print(f"Creating super admin user: {sa_email}")
            user = create_user(db, UserCreate(
                email=sa_email, 
                password=sa_password, 
                full_name=os.getenv("SUPERADMIN_NAME", "System Super Admin"), 
                user_type="super_admin"
            ))
            if user:
                print(f"Super Admin created successfully! ID: {user.id}")
            else:
                print("Super Admin already exists or couldn't be created.")

        # 2. Seed regular Admin
        email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        password = os.getenv("ADMIN_PASSWORD", "admin123")
        full_name = os.getenv("ADMIN_NAME", "System Admin")
        
        print(f"Creating admin user: {email}")
        user = create_user(db, UserCreate(
            email=email, 
            password=password, 
            full_name=full_name, 
            user_type="admin"
        ))
        if user:
            print(f"Admin created successfully! ID: {user.id}")
        else:
            print("Admin already exists or couldn't be created.")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
