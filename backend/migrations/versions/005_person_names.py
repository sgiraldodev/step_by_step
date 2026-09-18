"""Nombre personal y acceso exclusivamente por correo, sin eliminar información previa."""

import sqlalchemy as sa
from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("name", sa.String(100)))
    op.execute(
        sa.text("UPDATE users SET name = username WHERE name IS NULL AND username IS NOT NULL")
    )


def downgrade():
    raise RuntimeError(
        "No se elimina el nombre personal automáticamente para evitar pérdida de información."
    )
