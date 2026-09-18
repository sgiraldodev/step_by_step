"""Private user workspaces and recoverable authentication; preserve original data."""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None
LEGACY = "00000000-0000-4000-8000-000000000001"


def upgrade():
    op.create_table("users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("username", sa.String(50), unique=True),
        sa.Column("email", sa.String(254), unique=True),
        sa.Column("password_hash", sa.String(300)),
        sa.Column("recovery_hash", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    tables = ["tasks", "routines", "tags"]
    bind = op.get_bind()
    if any(bind.execute(sa.text(f"SELECT count(*) FROM {table}")).scalar() for table in tables):
        bind.execute(sa.text("INSERT INTO users (id) VALUES (:id)"), {"id": LEGACY})
    for table in tables:
        op.add_column(table, sa.Column("owner_id", sa.String(36)))
        bind.execute(sa.text(f"UPDATE {table} SET owner_id = :id"), {"id": LEGACY})
        op.alter_column(table, "owner_id", nullable=False)
        op.create_foreign_key(f"fk_{table}_owner", table, "users", ["owner_id"], ["id"])
        op.create_index(f"ix_{table}_owner_id", table, ["owner_id"])
    op.drop_constraint("tags_normalized_name_key", "tags", type_="unique")
    op.create_unique_constraint("unique_owner_tag", "tags", ["owner_id", "normalized_name"])
    for table in ["login_sessions", "password_resets"]:
        op.create_table(table,
            sa.Column("token_hash", sa.String(64), primary_key=True),
            sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_login_sessions_user_id", "login_sessions", ["user_id"])
    op.create_table("auth_limits", sa.Column("key", sa.String(64), primary_key=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer, nullable=False))
    op.add_column("cycle_receipts", sa.Column("kind", sa.String(20), nullable=False, server_default="work"))


def downgrade():
    raise RuntimeError("La migración de espacios privados no se revierte automáticamente para evitar mezclar datos de usuarios.")
