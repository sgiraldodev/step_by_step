import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app
from tests.database import SessionLocal


@pytest.fixture
def client(tmp_path):
    # Cada prueba crea su propia base; nunca vacía una base existente.
    database_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{database_path.as_posix()}")
    async_engine = create_async_engine(f"sqlite+aiosqlite:///{database_path.as_posix()}")
    sessions = async_sessionmaker(async_engine, expire_on_commit=False)
    SessionLocal.configure(bind=engine)
    Base.metadata.create_all(engine)

    async def isolated_db():
        async with sessions() as db:
            try:
                yield db
            except Exception:
                await db.rollback()
                raise

    app.dependency_overrides[get_db] = isolated_db
    try:
        with TestClient(app, headers={"X-Step-Client": "web"}) as client:
            assert (
                client.post(
                    "/auth/register",
                    json={
                        "name": "Persona de prueba",
                        "email": "test@example.test",
                        "password": "A-test-password-2026",
                    },
                ).status_code
                == 201
            )
            yield client
            client.portal.call(async_engine.dispose)
    finally:
        app.dependency_overrides.clear()
        engine.dispose()
