from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.domain import PriorityEnum, StatusEnum


class TagCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=50)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    color: str


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=300)
    priority: PriorityEnum = PriorityEnum.media
    tag_ids: list[UUID] = Field(default_factory=list, max_length=10)


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    action: Literal["update", "start", "resolve", "check", "uncheck", "interrupt", "restore"] = (
        "update"
    )
    title: str | None = Field(default=None, min_length=1, max_length=300)
    priority: PriorityEnum | None = None
    status: StatusEnum | None = None
    cycles_invested: int | None = Field(default=None, ge=0)
    expected_cycles: int | None = Field(default=None, ge=0)
    finished: bool | None = None
    operation_id: UUID | None = None
    seconds: int | None = Field(default=None, ge=0, le=10800)
    tag_ids: list[UUID] | None = Field(default=None, max_length=10)

    @model_validator(mode="after")
    def validate_action(self):
        editable = {"title", "priority", "status", "cycles_invested", "expected_cycles", "tag_ids"}
        if self.action in {"resolve", "interrupt"}:
            if (
                self.operation_id is None
                or (self.action == "resolve" and self.finished is None)
                or (
                    self.action == "interrupt"
                    and (self.finished is not None or self.seconds is None)
                )
            ):
                raise ValueError("resolve requiere finished y operation_id")
            if self.model_fields_set & editable:
                raise ValueError("resolve no acepta campos de edición")
        elif self.finished is not None or self.operation_id is not None or self.seconds is not None:
            raise ValueError("finished y operation_id solo se usan con resolve")
        if (
            self.action in {"start", "check", "uncheck", "restore"}
            and self.model_fields_set & editable
        ):
            raise ValueError("Esta acción no acepta campos de edición")
        if any(getattr(self, field) is None for field in self.model_fields_set & editable):
            raise ValueError("Los campos de edición no pueden ser null")
        return self


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    priority: PriorityEnum
    status: StatusEnum
    cycles_invested: int
    created_at: datetime
    updated_at: datetime | None
    routine_id: int | None
    routine_date: date | None
    tags: list[TagRead]


class RoutineCreate(TaskCreate):
    pass


class RoutineUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    title: str | None = Field(default=None, min_length=1, max_length=300)
    priority: PriorityEnum | None = None
    active: bool | None = None
    tag_ids: list[UUID] | None = Field(default=None, max_length=10)

    @model_validator(mode="after")
    def forbid_nulls(self):
        if any(getattr(self, field) is None for field in self.model_fields_set):
            raise ValueError("Los campos de edición no pueden ser null")
        return self


class RoutineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    priority: PriorityEnum
    active: bool
    tags: list[TagRead]
    created_at: datetime
    updated_at: datetime | None


class RoutineDay(BaseModel):
    date: date
    time_zone: str
    items: list[RoutineRead]
    today_tasks: list[TaskRead]
