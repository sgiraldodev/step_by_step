from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApplicationError(Exception):
    def __init__(self, status_code: int, message: str, code: str | None = None):
        self.status_code = status_code
        self.message = message
        self.code = code or {
            400: "INVALID_REQUEST",
            401: "AUTH_REQUIRED",
            403: "ACCESS_DENIED",
            404: "RESOURCE_NOT_FOUND",
            409: "STATE_CONFLICT",
            422: "INVALID_OPERATION",
            429: "RATE_LIMITED",
            503: "SERVICE_UNAVAILABLE",
        }.get(status_code, "APPLICATION_ERROR")
        super().__init__(message)


async def application_error_handler(request: Request, error: ApplicationError):
    return JSONResponse(
        status_code=error.status_code,
        content={"detail": {"code": error.code, "message": error.message}},
    )


async def validation_error_handler(request: Request, error: RequestValidationError):
    message = "Revisa los campos de la solicitud."
    if request.url.path.endswith("/auth/register"):
        field_messages = {
            "name": "Escribe tu nombre, de 1 a 100 caracteres.",
            "email": "Escribe un correo electrónico válido.",
            "password": "La contraseña debe tener entre 10 y 128 caracteres.",
        }
        messages = dict.fromkeys(
            field_messages[issue["loc"][-1]]
            for issue in error.errors()
            if issue["loc"] and issue["loc"][-1] in field_messages
        )
        if messages:
            message = " ".join(messages)
    return JSONResponse(
        status_code=422,
        content={"detail": {"code": "VALIDATION_ERROR", "message": message}},
    )


def owner(db):
    value = db.info.get("user_id")
    if not value:
        raise ApplicationError(401, "Inicia sesión para continuar.")
    return value
