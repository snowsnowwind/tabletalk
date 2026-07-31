import getpass
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

        new_password = getpass.getpass("New admin password: ")
        confirmation = getpass.getpass("Repeat new admin password: ")
        if new_password != confirmation:
            raise ValueError("Password confirmation does not match.")
        if len(new_password) < 8:
            raise ValueError("Password must contain at least 8 characters.")
        hashed = get_password_hash(new_password)

        user.hashed_password = hashed
        db.commit()
        print(f"Password for {user.email} was reset using bcrypt_sha256.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password()
