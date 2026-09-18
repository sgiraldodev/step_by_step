"""Preferencia de color persistente por usuario, sin modificar datos existentes."""

import sqlalchemy as sa
from alembic import op

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users", sa.Column("app_color", sa.String(10), nullable=False, server_default="blue")
    )


def downgrade():
    raise RuntimeError("No se elimina la preferencia de color para evitar pérdida de información.")
