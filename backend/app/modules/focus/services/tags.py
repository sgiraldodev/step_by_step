from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession as Session

from app.core.exceptions import ApplicationError, owner
from app.modules.focus.models import Tag
from app.modules.focus.repository import TagRepository
from app.modules.focus.schemas import TagCreate


class TagService:
    @staticmethod
    async def list(db):
        return await TagRepository.list(db)

    @staticmethod
    async def selected(db, ids):
        tags = await TagRepository.selected(db, ids)
        if len(tags) != len({str(value) for value in ids}):
            raise ApplicationError(422, "Una de las etiquetas no existe.")
        return tags

    @staticmethod
    async def create(db: Session, data: TagCreate):
        name = " ".join(data.name.split())
        normalized = name.casefold()
        if not normalized:
            raise ApplicationError(422, "Escribe un nombre para la etiqueta.")
        existing = await TagRepository.named(db, normalized)
        if existing:
            return existing
        tag = Tag(
            owner_id=owner(db), name=name, normalized_name=normalized, color=data.color.lower()
        )
        db.add(tag)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            return await TagRepository.named(db, normalized)
        await db.refresh(tag)
        return tag
