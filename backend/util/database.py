"""Database connection and session management."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Normalize the URL to use psycopg2 (sync driver) regardless of what's in .env
# Supports: postgresql+asyncpg://, postgresql://, postgres://
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# asyncpg uses ?ssl=require, psycopg2 uses ?sslmode=require
DATABASE_URL = DATABASE_URL.replace("?ssl=require", "?sslmode=require")
DATABASE_URL = DATABASE_URL.replace("&ssl=require", "&sslmode=require")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """FastAPI dependency that provides a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
