from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import owner
from app.modules.focus.models import CycleReceipt, Routine, Tag, Task


class TagRepository:
    @staticmethod
    async def list(db: AsyncSession):
        return (
            await db.scalars(select(Tag).where(Tag.owner_id == owner(db)).order_by(Tag.name))
        ).all()

    @staticmethod
    async def selected(db: AsyncSession, ids):
        ids = {str(value) for value in ids}
        return (
            (await db.scalars(select(Tag).where(Tag.id.in_(ids), Tag.owner_id == owner(db)))).all()
            if ids
            else []
        )

    @staticmethod
    async def named(db: AsyncSession, normalized: str):
        return await db.scalar(
            select(Tag).where(Tag.normalized_name == normalized, Tag.owner_id == owner(db))
        )


class StatisticsRepository:
    @staticmethod
    async def receipts(db: AsyncSession, start: datetime, end: datetime):
        return (
            await db.scalars(
                select(CycleReceipt)
                .join(Task, CycleReceipt.task_id == Task.id)
                .where(
                    Task.owner_id == owner(db),
                    CycleReceipt.completed_at >= start,
                    CycleReceipt.completed_at < end,
                    CycleReceipt.seconds > 0,
                )
            )
        ).all()

    @staticmethod
    async def total_cycles(db: AsyncSession):
        return (
            await db.scalar(
                select(func.coalesce(func.sum(Task.cycles_invested), 0)).where(
                    Task.owner_id == owner(db)
                )
            )
            or 0
        )

    @staticmethod
    async def recorded_cycles(db: AsyncSession):
        return (
            await db.scalar(
                select(func.count())
                .select_from(CycleReceipt)
                .join(Task, CycleReceipt.task_id == Task.id)
                .where(
                    Task.owner_id == owner(db),
                    CycleReceipt.seconds.is_not(None),
                    CycleReceipt.kind == "work",
                )
            )
            or 0
        )


class RoutineRepository:
    @staticmethod
    async def get(db: AsyncSession, routine_id: int):
        return await db.scalar(
            select(Routine)
            .where(Routine.id == routine_id, Routine.owner_id == owner(db))
            .with_for_update()
        )

    @staticmethod
    async def list(db: AsyncSession):
        return (
            await db.scalars(
                select(Routine)
                .where(Routine.owner_id == owner(db))
                .order_by(Routine.id)
                .with_for_update()
            )
        ).all()

    @staticmethod
    async def daily_tasks(db: AsyncSession, routine_ids: list[int], day: date):
        return (
            await db.scalars(
                select(Task).where(
                    Task.owner_id == owner(db),
                    Task.routine_id.in_(routine_ids),
                    Task.routine_date == day,
                )
            )
        ).all()

    @staticmethod
    async def today_task(db: AsyncSession, routine_id: int, day: date):
        return await db.scalar(
            select(Task)
            .where(
                Task.owner_id == owner(db), Task.routine_id == routine_id, Task.routine_date == day
            )
            .with_for_update()
        )

    @staticmethod
    async def history(db: AsyncSession, routine_id: int):
        return (
            await db.scalars(
                select(Task)
                .where(Task.owner_id == owner(db), Task.routine_id == routine_id)
                .order_by(Task.routine_date.desc())
                .limit(30)
            )
        ).all()


class TaskRepository:
    @staticmethod
    async def get(db: AsyncSession, task_id: int):
        return await db.scalar(
            select(Task).where(Task.id == task_id, Task.owner_id == owner(db)).with_for_update()
        )

    @staticmethod
    async def list(db: AsyncSession):
        return (
            await db.scalars(
                select(Task)
                .where(Task.routine_id.is_(None), Task.owner_id == owner(db))
                .order_by(Task.created_at.desc(), Task.id.desc())
            )
        ).all()

    @staticmethod
    async def receipt(db: AsyncSession, operation_id: str):
        return await db.get(CycleReceipt, operation_id)
