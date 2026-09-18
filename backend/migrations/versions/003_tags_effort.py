"""Reusable labels and timed, historical work receipts; preserve legacy cycles."""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("tags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("normalized_name", sa.String(100), nullable=False, unique=True),
        sa.Column("color", sa.String(7), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    for table, entity in [("task_tags", "tasks"), ("routine_tags", "routines")]:
        op.create_table(table,
            sa.Column("task_id" if entity == "tasks" else "routine_id", sa.Integer, sa.ForeignKey(f"{entity}.id"), primary_key=True),
            sa.Column("tag_id", sa.String(36), sa.ForeignKey("tags.id"), primary_key=True))
    op.add_column("cycle_receipts", sa.Column("seconds", sa.Integer))
    op.add_column("cycle_receipts", sa.Column("completed_at", sa.DateTime(timezone=True)))
    op.add_column("cycle_receipts", sa.Column("tag_snapshot", sa.JSON))
    op.create_index("ix_cycle_receipts_completed_at", "cycle_receipts", ["completed_at"])
    op.create_check_constraint("valid_effort_seconds", "cycle_receipts", "seconds IS NULL OR (seconds >= 0 AND seconds <= 10800)")


def downgrade():
    op.drop_constraint("valid_effort_seconds", "cycle_receipts", type_="check")
    op.drop_index("ix_cycle_receipts_completed_at", "cycle_receipts")
    for column in ["tag_snapshot", "completed_at", "seconds"]:
        op.drop_column("cycle_receipts", column)
    op.drop_table("routine_tags")
    op.drop_table("task_tags")
    op.drop_table("tags")
