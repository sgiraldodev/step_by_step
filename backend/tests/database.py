from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

assert settings.database_url.startswith("sqlite:"), "Las pruebas requieren SQLite aislado."
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(engine, expire_on_commit=False)
