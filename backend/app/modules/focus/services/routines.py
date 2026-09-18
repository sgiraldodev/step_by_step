from sqlalchemy.ext.asyncio import AsyncSession as Session

from app.core import domain
from app.core.domain import APP_TIMEZONE
from app.core.exceptions import ApplicationError, owner
from app.modules.focus.models import Routine, Task
from app.modules.focus.repository import RoutineRepository
from app.modules.focus.schemas import RoutineCreate, RoutineUpdate
from app.modules.focus.services.tags import TagService


class RoutineService:
    @staticmethod
    async def get(db, routine_id):
        routine = await RoutineRepository.get(db, routine_id)
        if routine is None:
            raise ApplicationError(404, "La rutina no existe.")
        return routine

    @staticmethod
    async def history(db, routine_id):
        await RoutineService.get(db, routine_id)
        return await RoutineRepository.history(db, routine_id)

    @staticmethod
    async def day(db: Session):
        today = domain.business_date()
        routines = await RoutineRepository.list(db)
        active_ids = [routine.id for routine in routines if routine.active]
        existing = await RoutineRepository.daily_tasks(db, active_ids, today)
        by_routine = {task.routine_id: task for task in existing}
        for routine in routines:
            if routine.active and routine.id not in by_routine:
                task = Task(
                    owner_id=owner(db),
                    title=routine.title,
                    priority=routine.priority,
                    routine_id=routine.id,
                    routine_date=today,
                    tags=list(routine.tags),
                )
                db.add(task)
                by_routine[routine.id] = task
        await db.commit()
        return {
            "date": today,
            "time_zone": APP_TIMEZONE,
            "items": routines,
            "today_tasks": list(by_routine.values()),
        }

    @staticmethod
    async def create(db: Session, data: RoutineCreate):
        routine = Routine(
            owner_id=owner(db),
            **data.model_dump(exclude={"tag_ids"}),
            tags=await TagService.selected(db, data.tag_ids),
        )
        db.add(routine)
        await db.commit()
        await db.refresh(routine)
        return routine

    @staticmethod
    async def update(db: Session, routine_id: int, data: RoutineUpdate):
        routine = await RoutineService.get(db, routine_id)
        for field, value in data.model_dump(exclude_unset=True, exclude={"tag_ids"}).items():
            setattr(routine, field, value)
        if data.tag_ids is not None:
            routine.tags = await TagService.selected(db, data.tag_ids)
        today_task = await RoutineRepository.today_task(db, routine_id, domain.business_date())
        if today_task:
            today_task.title = routine.title
            today_task.priority = routine.priority
            today_task.tags = list(routine.tags)
        await db.commit()
        await db.refresh(routine)
        return routine
