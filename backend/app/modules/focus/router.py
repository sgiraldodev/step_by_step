from datetime import date
from uuid import UUID

from fastapi import APIRouter

from app.core.database import DB
from app.modules.auth.dependencies import CurrentUser
from app.modules.focus.schemas import (
    RoutineCreate,
    RoutineDay,
    RoutineRead,
    RoutineUpdate,
    TagCreate,
    TagRead,
    TaskCreate,
    TaskRead,
    TaskUpdate,
)
from app.modules.focus.service import RoutineService, StatisticsService, TagService, TaskService

router = APIRouter()


@router.post("/tasks", response_model=TaskRead, status_code=201)
async def create_task(data: TaskCreate, db: DB, user: CurrentUser):
    return await TaskService.create(db, data)


@router.get("/tasks", response_model=list[TaskRead])
async def list_tasks(db: DB, user: CurrentUser):
    return await TaskService.list(db)


@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task(task_id: int, db: DB, user: CurrentUser):
    return await TaskService.get(db, task_id)


@router.patch("/tasks/{task_id}", response_model=TaskRead)
@router.put("/tasks/{task_id}", response_model=TaskRead, include_in_schema=False)
async def update_task(task_id: int, data: TaskUpdate, db: DB, user: CurrentUser):
    return await TaskService.update(db, task_id, data)


@router.post("/routines", response_model=RoutineRead, status_code=201)
async def create_routine(data: RoutineCreate, db: DB, user: CurrentUser):
    return await RoutineService.create(db, data)


@router.get("/routines", response_model=RoutineDay)
async def list_routines(db: DB, user: CurrentUser):
    return await RoutineService.day(db)


@router.patch("/routines/{routine_id}", response_model=RoutineRead)
@router.put("/routines/{routine_id}", response_model=RoutineRead, include_in_schema=False)
async def update_routine(routine_id: int, data: RoutineUpdate, db: DB, user: CurrentUser):
    return await RoutineService.update(db, routine_id, data)


@router.get("/routines/{routine_id}/history", response_model=list[TaskRead])
async def routine_history(routine_id: int, db: DB, user: CurrentUser):
    return await RoutineService.history(db, routine_id)


@router.get("/tags", response_model=list[TagRead])
async def list_tags(db: DB, user: CurrentUser):
    return await TagService.list(db)


@router.post("/tags", response_model=TagRead, status_code=201)
async def create_tag(data: TagCreate, db: DB, user: CurrentUser):
    return await TagService.create(db, data)


@router.get("/statistics")
async def statistics(
    db: DB, date_from: date, date_to: date, user: CurrentUser, tag_id: UUID | None = None
):
    return await StatisticsService.report(db, date_from, date_to, tag_id)
