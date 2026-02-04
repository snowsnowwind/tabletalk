
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.services.auth import get_password_hash

def reset_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@tabletalk.com").first()
        if not user:
            print("User not found!")
            return
        
        new_password = "admin123"
        hashed = get_password_hash(new_password)
        print(f"Generated hash: {hashed}")
        
        user.hashed_password = hashed
        db.commit()
        print(f"✅ Password for {user.email} reset to: {new_password}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password()
