"""Initial task and idempotency receipt tables."""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    priority = sa.Enum("baja", "media", "alta", "urgente", name="priorityenum")
    status = sa.Enum("pendiente", "en_progreso", "terminada", name="statusenum")
    op.create_table("tasks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("priority", priority, nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("cycles_invested", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("cycles_invested >= 0", name="positive_cycles"))
    op.create_index("ix_tasks_id", "tasks", ["id"])
    op.create_index("ix_tasks_title", "tasks", ["title"])
    op.create_table("cycle_receipts",
        sa.Column("operation_id", sa.String(36), primary_key=True),
        sa.Column("task_id", sa.Integer, sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("finished", sa.Boolean, nullable=False))

def downgrade():
    op.drop_table("cycle_receipts")
    op.drop_table("tasks")
    sa.Enum(name="statusenum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="priorityenum").drop(op.get_bind(), checkfirst=True)
