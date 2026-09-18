"""Durable routine templates with independent daily task snapshots."""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    # PriorityEnum already exists: reuse it rather than creating another PostgreSQL type.
    from sqlalchemy.dialects.postgresql import ENUM
    priority = ENUM("baja", "media", "alta", "urgente", name="priorityenum", create_type=False)
    op.create_table("routines",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("priority", priority, nullable=False),
        sa.Column("active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    with op.batch_alter_table("tasks") as batch:
        batch.add_column(sa.Column("routine_id", sa.Integer))
        batch.add_column(sa.Column("routine_date", sa.Date))
        batch.create_foreign_key("fk_tasks_routine_id", "routines", ["routine_id"], ["id"])
        batch.create_index("ix_tasks_routine_id", ["routine_id"])
        batch.create_unique_constraint("unique_routine_day", ["routine_id", "routine_date"])
        batch.create_check_constraint("routine_date_pair", "(routine_id IS NULL AND routine_date IS NULL) OR (routine_id IS NOT NULL AND routine_date IS NOT NULL)")


def downgrade():
    with op.batch_alter_table("tasks") as batch:
        batch.drop_constraint("routine_date_pair", type_="check")
        batch.drop_constraint("unique_routine_day", type_="unique")
        batch.drop_index("ix_tasks_routine_id")
        batch.drop_constraint("fk_tasks_routine_id", type_="foreignkey")
        batch.drop_column("routine_date")
        batch.drop_column("routine_id")
    op.drop_table("routines")
