import hmac
import secrets
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.domain import LEGACY_OWNER_ID
from app.core.exceptions import ApplicationError
from app.core.security import DUMMY_PASSWORD, hash_password, token_hash, utc, verify_password
from app.integrations.email.service import is_configured, send_email_safely, sender_address
from app.modules.auth.models import AuthLimit, LoginSession, PasswordReset, User
from app.modules.auth.repository import AuthRepository


class AuthService:
    @staticmethod
    async def throttle(db, client_address, action, identity="", limit=8, minutes=15):
        key = token_hash(f"{action}:{client_address}:{identity.strip().lower()}")
        now = datetime.now(timezone.utc)
        row = await AuthRepository.limit(db, key)
        if row and utc(row.started_at) + timedelta(minutes=minutes) <= now:
            row.started_at, row.attempts = (now, 0)
        if row and row.attempts >= limit:
            raise ApplicationError(
                429, "Demasiados intentos. Espera unos minutos y vuelve a intentarlo."
            )
        if row:
            row.attempts += 1
        else:
            db.add(AuthLimit(key=key, started_at=now, attempts=1))
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise ApplicationError(429, "Inténtalo de nuevo en unos minutos.")

    @staticmethod
    def public(user):
        return {
            "id": user.id,
            "name": user.name or user.username or user.email,
            "email": user.email,
            "app_color": user.app_color,
        }

    @staticmethod
    async def save_color(db, user_id, color):
        user = await AuthRepository.set_color(db, user_id, color)
        await db.commit()
        return AuthService.public(user)

    @staticmethod
    async def session(db, user):
        raw = secrets.token_urlsafe(32)
        db.add(
            LoginSession(
                token_hash=token_hash(raw),
                user_id=user.id,
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            )
        )
        await db.commit()
        return (AuthService.public(user), raw)

    @staticmethod
    async def register(db, data):
        if await AuthRepository.find(db, data.email):
            raise ApplicationError(409, "El correo electrónico ya está registrado.")
        verification = await AuthRepository.email_verification(db, data.email)
        if (
            not verification
            or not verification.token_hash
            or utc(verification.expires_at) <= datetime.now(timezone.utc)
            or not hmac.compare_digest(verification.token_hash, token_hash(data.verification_token))
        ):
            raise ApplicationError(400, "Valida tu correo antes de crear la cuenta.")
        code = secrets.token_urlsafe(32)
        user = None
        if data.setup_code:
            expected = settings.initial_setup_token
            if not expected or not hmac.compare_digest(data.setup_code, expected):
                raise ApplicationError(403, "El código de instalación no es válido.")
            user = await AuthRepository.user(db, LEGACY_OWNER_ID, lock=True)
            if user is None or user.password_hash:
                raise ApplicationError(409, "El espacio original ya tiene propietario.")
        if user is None:
            user = User()
            db.add(user)
        user.name, user.email = (data.name, data.email.strip().lower())
        user.password_hash, user.recovery_hash = (hash_password(data.password), token_hash(code))
        verification.token_hash = None
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise ApplicationError(409, "El correo electrónico ya está registrado.")
        public_user, raw = await AuthService.session(db, user)
        return ({"user": public_user, "recovery_code": code}, raw)

    @staticmethod
    async def reset(db, data):
        user = None
        reset = None
        if data.token:
            reset = await AuthRepository.reset(db, token_hash(data.token), lock=False)
            if reset and utc(reset.expires_at) > datetime.now(timezone.utc):
                user = await AuthRepository.user(db, reset.user_id, lock=True)
                reset = await AuthRepository.reset(db, token_hash(data.token))
                if not reset or utc(reset.expires_at) <= datetime.now(timezone.utc):
                    user = None
        elif data.email and data.recovery_code:
            candidate = await AuthRepository.find(db, data.email)
            if candidate:
                candidate = await AuthRepository.user(db, candidate.id, lock=True)
                if candidate.recovery_hash and hmac.compare_digest(
                    candidate.recovery_hash, token_hash(data.recovery_code)
                ):
                    user = candidate
        if user is None or user.password_hash is None:
            raise ApplicationError(400, "El código o enlace no es válido o ya venció.")
        code = secrets.token_urlsafe(32)
        user.password_hash, user.recovery_hash = (hash_password(data.password), token_hash(code))
        await AuthRepository.revoke_sessions(db, user.id)
        await AuthRepository.remove_resets(db, user.id)
        await db.commit()
        return {"message": "Contraseña actualizada. Inicia sesión de nuevo.", "recovery_code": code}

    @staticmethod
    async def forgot(db, data, background):
        if not is_configured() or not settings.app_origin:
            raise ApplicationError(
                503, "El envío de correo no está configurado. Usa tu código de recuperación."
            )
        user = await AuthRepository.find(db, data.email)
        if user and user.password_hash:
            raw = secrets.token_urlsafe(32)
            await AuthRepository.remove_resets(db, user.id)
            db.add(
                PasswordReset(
                    token_hash=token_hash(raw),
                    user_id=user.id,
                    expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
                )
            )
            await db.commit()
            message = EmailMessage()
            message["From"] = sender_address()
            message["To"] = user.email
            message["Subject"] = "Restablecer contraseña · Step by step"
            origin = settings.app_origin.rstrip("/")
            message.set_content(
                f"Abre este enlace para elegir una nueva contraseña. Vence en 30 minutos y solo se puede usar una vez.\n\n{origin}/#reset={raw}\n\nSi no lo solicitaste, ignora este correo."
            )
            background.add_task(send_email_safely, message)
        return {
            "message": "Si la cuenta existe, recibirás un enlace para restablecer tu contraseña."
        }

    @staticmethod
    async def status(db):
        user = await AuthRepository.user(db, LEGACY_OWNER_ID)
        return {
            "setup_required": bool(user and (not user.password_hash)),
            "email_recovery": is_configured(),
        }

    @staticmethod
    async def current_user(db, raw):
        session = await AuthRepository.session(db, token_hash(raw)) if raw else None
        user = (
            await AuthRepository.user(db, session.user_id)
            if session and utc(session.expires_at) > datetime.now(timezone.utc)
            else None
        )
        if user is None or user.password_hash is None:
            raise ApplicationError(401, "Tu sesión venció. Inicia sesión para continuar.")
        db.info["user_id"] = user.id
        return user

    @staticmethod
    async def login(db, data):
        user = await AuthRepository.find(db, data.email)
        valid = verify_password(
            data.password, user.password_hash if user and user.password_hash else DUMMY_PASSWORD
        )
        if not user or not user.password_hash or (not valid):
            raise ApplicationError(401, "Correo electrónico o contraseña incorrectos.")
        return await AuthService.session(db, user)

    @staticmethod
    async def logout(db, raw):
        await AuthRepository.logout(db, token_hash(raw))
        await db.commit()
        return {"message": "Sesión cerrada."}
