
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

def migrate():
    print("Migrating reservations table...")
    with engine.connect() as conn:
        try:
            # Check if user_id is already nullable (optional but good)
            # Just try to alter it. command for PostgreSQL:
            conn.execute(text("ALTER TABLE reservations ALTER COLUMN user_id DROP NOT NULL;"))
            conn.commit()
            print("Successfully made user_id nullable.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
