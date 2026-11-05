from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from app.config import get_settings


def get_engine() -> Engine:
    settings = get_settings()

    if not settings.database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Set it in the backend environment before using the database."
        )

    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )


def check_database_connection() -> bool:
    """Run a read-only connectivity check; never modify database records."""
    engine = get_engine()

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    finally:
        engine.dispose()
