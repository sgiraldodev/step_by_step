from fastapi import APIRouter, BackgroundTasks, Request, Response

from app.core.config import settings
from app.core.database import DB
from app.modules.auth.dependencies import CurrentUser
from app.modules.auth.email_recovery import EmailRecoveryService
from app.modules.auth.email_verification import EmailVerificationService
from app.modules.auth.schemas import (
    ColorPreferenceInput,
    EmailCodeInput,
    LoginInput,
    RecoveryInput,
    RegisterInput,
    ResetInput,
)
from app.modules.auth.service import AuthService

router = APIRouter()


def set_session_cookie(response: Response, raw: str):
    response.set_cookie(
        settings.session_cookie_name,
        raw,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=604800,
        path="/",
    )


@router.get("/auth/status")
async def auth_status(db: DB):
    return await AuthService.status(db)


@router.get("/auth/me")
async def auth_me(user: CurrentUser):
    return AuthService.public(user)


@router.post("/auth/register", status_code=201)
async def auth_register(data: RegisterInput, request: Request, response: Response, db: DB):
    await AuthService.throttle(
        db, request.client.host if request.client else "local", "register", limit=10, minutes=60
    )
    payload, raw = await AuthService.register(db, data)
    set_session_cookie(response, raw)
    return payload


@router.patch("/auth/preferences")
async def auth_preferences(data: ColorPreferenceInput, user: CurrentUser, db: DB):
    return await AuthService.save_color(db, user.id, data.app_color)


@router.post("/auth/login")
async def auth_login(data: LoginInput, request: Request, response: Response, db: DB):
    await AuthService.throttle(
        db, request.client.host if request.client else "local", "login", data.email
    )
    user, raw = await AuthService.login(db, data)
    set_session_cookie(response, raw)
    return user


@router.post("/auth/logout")
async def auth_logout(request: Request, response: Response, db: DB):
    raw = request.cookies.get(settings.session_cookie_name, "")
    result = await AuthService.logout(db, raw)
    response.delete_cookie(settings.session_cookie_name, path="/")
    return result


@router.post("/auth/forgot-password")
async def auth_forgot(data: RecoveryInput, request: Request, background: BackgroundTasks, db: DB):
    await AuthService.throttle(
        db, request.client.host if request.client else "local", "forgot", limit=5, minutes=60
    )
    return await AuthService.forgot(db, data, background)


@router.post("/auth/reset-password")
async def auth_reset(data: ResetInput, request: Request, db: DB):
    await AuthService.throttle(
        db, request.client.host if request.client else "local", "reset", limit=8, minutes=60
    )
    return await AuthService.reset(db, data)


@router.post("/auth/recovery-code")
async def auth_send_code(data: RecoveryInput, request: Request, db: DB):
    await AuthService.throttle(
        db,
        request.client.host if request.client else "local",
        "email-code-send",
        limit=5,
        minutes=60,
    )
    await AuthService.throttle(db, "account", "email-code-send", data.email, limit=5, minutes=60)
    return await EmailRecoveryService.send(db, data.email)


@router.post("/auth/recovery-code/verify")
async def auth_verify_code(data: EmailCodeInput, request: Request, db: DB):
    await AuthService.throttle(
        db,
        request.client.host if request.client else "local",
        "email-code-verify",
        limit=20,
        minutes=3,
    )
    await AuthService.throttle(db, "account", "email-code-verify", data.email, limit=5, minutes=3)
    return await EmailRecoveryService.verify(db, data)


@router.post("/auth/registration-code")
async def auth_registration_code(data: RecoveryInput, request: Request, db: DB):
    await AuthService.throttle(
        db,
        request.client.host if request.client else "local",
        "registration-code-send",
        limit=5,
        minutes=60,
    )
    await AuthService.throttle(
        db, "account", "registration-code-send", data.email, limit=5, minutes=60
    )
    return await EmailVerificationService.send(db, data.email)


@router.post("/auth/registration-code/verify")
async def auth_registration_verify(data: EmailCodeInput, request: Request, db: DB):
    await AuthService.throttle(
        db,
        request.client.host if request.client else "local",
        "registration-code-verify",
        limit=20,
        minutes=3,
    )
    await AuthService.throttle(
        db, "account", "registration-code-verify", data.email, limit=5, minutes=3
    )
    return await EmailVerificationService.verify(db, data)
