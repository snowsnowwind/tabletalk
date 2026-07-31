"""Allow guest corporate event requests in existing PostgreSQL databases."""

from sqlalchemy import text

from app.database import engine


def migrate() -> None:
    if engine.dialect.name != "postgresql":
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE corporate_events "
                "ALTER COLUMN user_id DROP NOT NULL"
            )
        )


if __name__ == "__main__":
    migrate()
    print("Corporate event guest submissions enabled.")
