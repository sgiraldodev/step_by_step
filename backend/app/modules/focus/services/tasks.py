from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession as Session

from app.core import domain
from app.core.domain import StatusEnum
from app.core.exceptions import ApplicationError, owner
from app.modules.focus.models import CycleReceipt, Task
from app.modules.focus.repository import TaskRepository
from app.modules.focus.schemas import TaskCreate, TaskUpdate
from app.modules.focus.services.routines import RoutineService
from app.modules.focus.services.tags import TagService


class TaskService:
    @staticmethod
    async def list(db):
        return await TaskRepository.list(db)

    @staticmethod
    async def get(db, task_id):
        task = await TaskRepository.get(db, task_id)
        if task is None:
            raise ApplicationError(404, "La tarea no existe.")
        return task

    @staticmethod
    async def delete(db: Session, task_id: int):
        task = await TaskService.get(db, task_id)
        if task.routine_id is not None:
            raise ApplicationError(
                409, "Los registros de rutina se eliminan al limpiar el espacio."
            )
        if task.status == StatusEnum.terminada:
            raise ApplicationError(409, "Solo puedes eliminar tareas pendientes o en progreso.")
        await TaskRepository.delete(db, task_id)
        await db.commit()

    @staticmethod
    async def create(db: Session, data: TaskCreate):
        task = Task(
            owner_id=owner(db),
            **data.model_dump(exclude={"tag_ids"}),
            tags=await TagService.selected(db, data.tag_ids),
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def update(db: Session, task_id: int, data: TaskUpdate):
        task = await TaskService.get(db, task_id)
        handlers = {
            "resolve": TaskService._resolve,
            "interrupt": TaskService._interrupt,
            "restore": TaskService._restore,
            "check": TaskService._check,
            "uncheck": TaskService._check,
            "start": TaskService._start,
        }
        await handlers.get(data.action, TaskService._edit)(db, task, data)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise ApplicationError(
                409, "El bloque ya fue registrado. Reintenta con el mismo identificador."
            )
        await db.refresh(task)
        return task

    @staticmethod
    async def _resolve(db, task, data):
        operation_id = str(data.operation_id)
        receipt = await TaskRepository.receipt(db, operation_id)
        if receipt:
            if (
                receipt.task_id != task.id
                or receipt.kind != "work"
                or receipt.finished != data.finished
                or (receipt.seconds != data.seconds)
            ):
                raise ApplicationError(409, "Este bloque ya fue resuelto con otra respuesta.")
            return task
        if task.status != StatusEnum.en_progreso:
            raise ApplicationError(409, "Solo una tarea en progreso puede registrar un ciclo.")
        task.cycles_invested += 1
        task.status = StatusEnum.terminada if data.finished else StatusEnum.en_progreso
        db.add(
            CycleReceipt(
                operation_id=operation_id,
                task_id=task.id,
                finished=data.finished,
                seconds=data.seconds,
                completed_at=datetime.now(timezone.utc) if data.seconds is not None else None,
                tag_snapshot=[
                    {"id": tag.id, "name": tag.name, "color": tag.color} for tag in task.tags
                ],
            )
        )

    @staticmethod
    async def _interrupt(db, task, data):
        operation_id = str(data.operation_id)
        receipt = await TaskRepository.receipt(db, operation_id)
        if receipt:
            if (
                receipt.task_id != task.id
                or receipt.kind != "interrupted"
                or receipt.seconds != data.seconds
            ):
                raise ApplicationError(409, "Este bloque ya fue registrado con otra acción.")
            return task
        if task.status != StatusEnum.en_progreso:
            raise ApplicationError(409, "Solo puedes cambiar una tarea en progreso.")
        task.status = StatusEnum.pendiente
        db.add(
            CycleReceipt(
                operation_id=operation_id,
                task_id=task.id,
                finished=False,
                kind="interrupted",
                seconds=data.seconds,
                completed_at=datetime.now(timezone.utc),
                tag_snapshot=[
                    {"id": tag.id, "name": tag.name, "color": tag.color} for tag in task.tags
                ],
            )
        )

    @staticmethod
    async def _restore(db, task, data):
        if task.status == StatusEnum.en_progreso:
            raise ApplicationError(409, "Usa Cambiar de tarea para guardar el bloque activo.")
        task.status = StatusEnum.pendiente

    @staticmethod
    async def _check(db, task, data):
        if task.routine_id is None:
            raise ApplicationError(409, "La casilla diaria solo está disponible para rutinas.")
        if task.routine_date != domain.business_date():
            raise ApplicationError(
                409, "Este registro corresponde a otro día. Recarga las rutinas."
            )
        routine = await RoutineService.get(db, task.routine_id)
        if not routine.active:
            raise ApplicationError(409, "Activa la rutina antes de marcarla.")
        task.status = StatusEnum.terminada if data.action == "check" else StatusEnum.pendiente

    @staticmethod
    async def _start(db, task, data):
        if task.status == StatusEnum.terminada:
            raise ApplicationError(409, "Una tarea terminada no puede iniciar otro bloque.")
        if task.routine_id is not None:
            routine = await RoutineService.get(db, task.routine_id)
            if not routine.active or task.routine_date != domain.business_date():
                raise ApplicationError(409, "Solo puedes iniciar una rutina activa de hoy.")
        task.status = StatusEnum.en_progreso

    @staticmethod
    async def _edit(db, task, data):
        values = data.model_dump(
            exclude_unset=True,
            exclude={"action", "finished", "operation_id", "expected_cycles", "seconds", "tag_ids"},
        )
        if data.expected_cycles is not None and data.expected_cycles != task.cycles_invested:
            raise ApplicationError(409, "La tarea cambió. Recarga antes de actualizar.")
        next_status = values.get("status", task.status)
        next_cycles = values.get("cycles_invested", task.cycles_invested)
        if next_cycles != task.cycles_invested:
            if data.expected_cycles is None:
                raise ApplicationError(422, "Incluye expected_cycles para actualizar los ciclos.")
            if (
                task.status != StatusEnum.en_progreso
                or next_cycles != task.cycles_invested + 1
                or next_status == StatusEnum.pendiente
            ):
                raise ApplicationError(409, "Solo se puede sumar un ciclo a una tarea en progreso.")
        if (
            next_status == StatusEnum.terminada
            and task.status != StatusEnum.terminada
            and (next_cycles != task.cycles_invested + 1)
        ):
            raise ApplicationError(
                409, "Terminar una tarea requiere registrar el ciclo completado."
            )
        if task.status == StatusEnum.terminada and next_status != task.status:
            raise ApplicationError(409, "La tarea ya está terminada.")
        if task.status == StatusEnum.en_progreso and next_status == StatusEnum.pendiente:
            raise ApplicationError(409, "Una tarea iniciada no vuelve a pendiente.")
        if data.tag_ids is not None:
            task.tags = await TagService.selected(db, data.tag_ids)
        for field, value in values.items():
            setattr(task, field, value)
