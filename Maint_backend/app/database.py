from prisma import Prisma
from app.utils.logger import logger

# Initialize the Prisma Client instance
db = Prisma()

async def connect_db() -> None:
    """Establish connection to PostgreSQL database."""
    try:
        if not db.is_connected():
            await db.connect()
            logger.info("Successfully connected to PostgreSQL database via Prisma ORM.")
    except Exception as e:
        logger.error(f"Failed to establish connection to PostgreSQL database: {e}")
        raise e

async def disconnect_db() -> None:
    """Safely terminate the connection to PostgreSQL database."""
    try:
        if db.is_connected():
            await db.disconnect()
            logger.info("Successfully closed database connection.")
    except Exception as e:
        logger.error(f"Error occurred while closing database connection: {e}")
