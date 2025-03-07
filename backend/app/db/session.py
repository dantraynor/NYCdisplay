from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/subway_db")
ASYNC_DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_pre_ping=True
)

# Create async sessionmaker
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    """
    Get async database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 