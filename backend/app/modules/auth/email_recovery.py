import secrets
from datetime import datetime, timedelta, timezone

from app.core.exceptions import ApplicationError
from app.core.security import token_hash, utc
from app.modules.auth.email_codes import CODE_MINUTES, deliver_code
from app.modules.auth.models import PasswordReset
from app.modules.auth.repository import AuthRepository


class EmailRecoveryService:
    @staticmethod
    def code_hash(user_id, code):
        return token_hash(f"email-code:{user_id}:{code}")

    @staticmethod
    async def send(db, email):
        user = await AuthRepository.find(db, email)
        if not user or not user.password_hash:
            raise ApplicationError(404, "No existe una cuenta con este correo electrónico.")
        user = await AuthRepository.user(db, user.id, lock=True)
        code = f"{secrets.randbelow(10000):04d}"
        await deliver_code(user.email, code, "recuperación")
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_MINUTES)
        await AuthRepository.remove_resets(db, user.id)
        db.add(
            PasswordReset(
                token_hash=EmailRecoveryService.code_hash(user.id, code),
                user_id=user.id,
                expires_at=expires_at,
                purpose="email_code",
            )
        )
        await db.commit()
        return {"message": "Enviamos un código de 4 dígitos a tu correo.", "expires_at": expires_at}

    @staticmethod
    async def verify(db, data):
        user = await AuthRepository.find(db, data.email)
        if user and user.password_hash:
            user = await AuthRepository.user(db, user.id, lock=True)
            reset = await AuthRepository.reset(
                db, EmailRecoveryService.code_hash(user.id, data.code), purpose="email_code"
            )
            if (
                reset
                and reset.user_id == user.id
                and utc(reset.expires_at) > datetime.now(timezone.utc)
            ):
                raw = secrets.token_urlsafe(32)
                await AuthRepository.remove_resets(db, user.id)
                db.add(
                    PasswordReset(
                        token_hash=token_hash(raw),
                        user_id=user.id,
                        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
                    )
                )
                await db.commit()
                return {"token": raw}
        raise ApplicationError(
            400, "El código no es válido o ya venció. Solicita otro si lo necesitas."
        )
