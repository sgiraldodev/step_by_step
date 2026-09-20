import secrets
from datetime import datetime, timedelta, timezone

from app.core.security import token_hash
from app.modules.auth.models import EmailVerification
from tests.database import SessionLocal


def verified_email(email):
    """Prepara un correo validado para pruebas ajenas al transporte de correo."""
    raw = secrets.token_urlsafe(32)
    with SessionLocal() as db:
        db.merge(
            EmailVerification(
                email=email.strip().lower(),
                code_hash=token_hash("fixture"),
                token_hash=token_hash(raw),
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
            )
        )
        db.commit()
    return raw
