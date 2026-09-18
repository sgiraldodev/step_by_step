"""Disposable UI preview only. Never seed the user's PostgreSQL database."""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.database import Base
from app.core.domain import PriorityEnum, StatusEnum
from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.focus.models import CycleReceipt, Tag, Task
from tests.database import SessionLocal, engine

assert engine.url.get_backend_name() == "sqlite", "Preview requires an isolated SQLite database."
Base.metadata.create_all(engine)
with SessionLocal() as db:
    if not db.query(Tag).count():
        user = User(
            name="Persona de prueba",
            email="preview@example.test",
            password_hash=hash_password("Preview-password-2026"),
        )
        db.add(user)
        db.flush()
        personal = Tag(
            owner_id=user.id, name="Personales", normalized_name="personales", color="#7c3aed"
        )
        work = Tag(owner_id=user.id, name="Laborales", normalized_name="laborales", color="#2563eb")
        health = Tag(owner_id=user.id, name="Salud", normalized_name="salud", color="#0891b2")
        db.add_all([personal, work, health])
        db.flush()
        now = datetime.now(timezone.utc)
        for title, tags, seconds, days in [
            ("Preparar propuesta", [work], 2700, 0),
            ("Leer y aprender", [personal, work], 1200, 1),
            ("Hacer ejercicio", [personal, health], 1800, 2),
            ("Organizar la casa", [personal], 900, 0),
            ("Planificar la semana", [], 600, 1),
        ]:
            task = Task(
                owner_id=user.id,
                title=title,
                priority=PriorityEnum.media,
                status=StatusEnum.terminada,
                cycles_invested=1,
                tags=tags,
            )
            db.add(task)
            db.flush()
            db.add(
                CycleReceipt(
                    operation_id=str(uuid4()),
                    task_id=task.id,
                    finished=True,
                    seconds=seconds,
                    completed_at=now - timedelta(days=days),
                    tag_snapshot=[
                        {"id": tag.id, "name": tag.name, "color": tag.color} for tag in tags
                    ],
                )
            )
        db.commit()
