from sqlalchemy.ext.asyncio import AsyncSession as Session

from app.modules.focus.repository import WorkspaceRepository


class WorkspaceService:
    @staticmethod
    async def clear(db: Session, keep_tags: bool):
        await WorkspaceRepository.clear(db, keep_tags)
        await db.commit()
