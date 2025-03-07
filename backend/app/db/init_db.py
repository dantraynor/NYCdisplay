from sqlalchemy.ext.asyncio import AsyncSession
from .session import engine
from ..models.base import Base
from ..models.subway import Trip, StopTimeUpdate, VehiclePosition, Alert, FeedUpdate

async def init_db():
    """Initialize the database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def clear_db():
    """Drop all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all) 