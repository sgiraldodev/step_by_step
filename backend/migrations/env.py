from alembic import context
from sqlalchemy import create_engine
from app.core.config import settings
from app.core.database import Base
from app.modules.auth import models as auth_models
from app.modules.focus import models as focus_models

if context.is_offline_mode():
    context.configure(url=settings.database_url, target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = create_engine(settings.database_url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()
