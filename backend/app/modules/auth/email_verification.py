import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError

from app.core.exceptions import ApplicationError
from app.core.security import token_hash, utc
from app.modules.auth.email_codes import CODE_MINUTES, deliver_code
from app.modules.auth.models import EmailVerification
from app.modules.auth.repository import AuthRepository


class EmailVerificationService:
    @staticmethod
    async def send(db, email):
        email = email.strip().lower()
        if await AuthRepository.find(db, email):
            raise ApplicationError(409, "El correo electrónico ya está registrado.")
        row = await AuthRepository.email_verification(db, email)
        code = f"{secrets.randbelow(10000):04d}"
        if row is None:
            row = EmailVerification(
                email=email, code_hash="", expires_at=datetime.now(timezone.utc)
            )
            db.add(row)
            try:
                await db.flush()
            except IntegrityError:
                await db.rollback()
                raise ApplicationError(429, "Ya hay un envío en curso. Inténtalo en unos minutos.")
        await deliver_code(email, code, "registro")
        row.code_hash = token_hash(f"registration:{email}:{code}")
        row.token_hash = None
        row.expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_MINUTES)
        await db.commit()
        return {
            "message": "Enviamos un código de 4 dígitos a tu correo.",
            "expires_at": row.expires_at,
        }

    @staticmethod
    async def verify(db, data):
        row = await AuthRepository.email_verification(db, data.email)
        expected = token_hash(f"registration:{data.email.strip().lower()}:{data.code}")
        if (
            not row
            or row.token_hash
            or utc(row.expires_at) <= datetime.now(timezone.utc)
            or not hmac.compare_digest(row.code_hash, expected)
        ):
            raise ApplicationError(
                400, "El código no es válido o ya venció. Solicita otro si lo necesitas."
            )
        raw = secrets.token_urlsafe(32)
        row.token_hash = token_hash(raw)
        row.code_hash = token_hash(raw)
        row.expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        await db.commit()
        return {"token": raw}
