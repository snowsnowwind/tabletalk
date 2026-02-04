
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User

def reset_password_plain():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@tabletalk.com").first()
        if not user:
            print("User not found!")
            return
        
        # Store PLAIN TEXT as requested by user
        new_password = "admin123"
        user.hashed_password = new_password
        db.commit()
        print(f"✅ Password for {user.email} set to PLAIN TEXT: {new_password}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password_plain()
