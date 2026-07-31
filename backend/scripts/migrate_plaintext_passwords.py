"""One-time migration for prototype databases created before password hashing."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.services.auth import get_password_hash


SUPPORTED_HASH_PREFIXES = ("$bcrypt-sha256$", "$2a$", "$2b$", "$2y$")


def migrate_plaintext_passwords() -> int:
    database = SessionLocal()
    migrated = 0
    try:
        for user in database.query(User).all():
            stored_value = user.hashed_password or ""
            if stored_value.startswith(SUPPORTED_HASH_PREFIXES):
                continue
            if not stored_value:
                raise ValueError(f"User {user.id} has an empty password value.")
            if stored_value.startswith("$"):
                raise ValueError(
                    f"User {user.id} has an unrecognised encoded password; "
                    "refusing to treat it as plaintext."
                )
            user.hashed_password = get_password_hash(stored_value)
            migrated += 1
        database.commit()
        return migrated
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    count = migrate_plaintext_passwords()
    print(f"Migrated {count} user password record(s) to bcrypt_sha256.")
