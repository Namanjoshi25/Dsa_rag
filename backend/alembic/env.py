from logging.config import fileConfig
from sqlalchemy import engine_from_config, create_engine
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import your models
from db.supabase import Base
from models.user_model import User  # Import all your models

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = os.getenv("SUPABASE_DB_URL")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Get URL directly from environment, don't use config
    database_url = os.getenv("SUPABASE_DB_URL")
    
    # Create engine directly instead of using engine_from_config
    connectable = create_engine(
        database_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()