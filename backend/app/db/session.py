from collections.abc import Generator
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


# Database is optional - document generation can work without it
engine = None
SessionLocal = None

if settings.database_url:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a SQLAlchemy session."""
    if SessionLocal is None:
        raise RuntimeError(
            "Database not configured. Set DATABASE_URL environment variable."
        )
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

