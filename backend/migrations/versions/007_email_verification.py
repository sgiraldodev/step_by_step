"""Verificación de correo antes del registro, sin modificar cuentas existentes."""

import sqlalchemy as sa
from alembic import op

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "password_resets",
        sa.Column("purpose", sa.String(20), nullable=False, server_default="token"),
    )
    op.create_table(
        "email_verifications",
        sa.Column("email", sa.String(254), primary_key=True),
        sa.Column("code_hash", sa.String(64), nullable=False),
        sa.Column("token_hash", sa.String(64)),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    raise RuntimeError("No se elimina información de verificación automáticamente.")
