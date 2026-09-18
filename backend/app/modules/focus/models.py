from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.core.domain import PriorityEnum, StatusEnum

task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id"), primary_key=True),
)
routine_tags = Table(
    "routine_tags",
    Base.metadata,
    Column("routine_id", Integer, ForeignKey("routines.id"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(50), nullable=False)
    normalized_name = Column(String(100), nullable=False)
    __table_args__ = (UniqueConstraint("owner_id", "normalized_name", name="unique_owner_tag"),)
    color = Column(String(7), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Routine(Base):
    __tablename__ = "routines"
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.media, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    tags = relationship("Tag", secondary=routine_tags, lazy="selectin", order_by="Tag.name")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("cycles_invested >= 0", name="positive_cycles"),
        UniqueConstraint("routine_id", "routine_date", name="unique_routine_day"),
        CheckConstraint(
            "(routine_id IS NULL AND routine_date IS NULL) OR (routine_id IS NOT NULL AND routine_date IS NOT NULL)",
            name="routine_date_pair",
        ),
    )
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), index=True, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.media, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.pendiente, nullable=False)
    cycles_invested = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    routine_id = Column(Integer, ForeignKey("routines.id"), index=True)
    routine_date = Column(Date)
    tags = relationship("Tag", secondary=task_tags, lazy="selectin", order_by="Tag.name")


class CycleReceipt(Base):
    """A durable idempotency key prevents duplicate effort after network retries."""

    __tablename__ = "cycle_receipts"
    operation_id = Column(String(36), primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    finished = Column(Boolean, nullable=False)
    seconds = Column(Integer)
    completed_at = Column(DateTime(timezone=True), index=True)
    tag_snapshot = Column(JSON)
    kind = Column(String(20), default="work", nullable=False)
    __table_args__ = (
        CheckConstraint(
            "seconds IS NULL OR (seconds >= 0 AND seconds <= 10800)", name="valid_effort_seconds"
        ),
    )
