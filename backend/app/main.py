import json
import logging
from contextlib import asynccontextmanager
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import DB, engine
from app.core.exceptions import (
    ApplicationError,
    application_error_handler,
    validation_error_handler,
)
from app.modules.auth.router import router as auth_router
from app.modules.focus.router import router as focus_router


@asynccontextmanager
async def lifespan(app):
    yield
    await engine.dispose()


logging.basicConfig(level=settings.log_level, format="%(message)s")
logger = logging.getLogger("step.requests")
app = FastAPI(title="Step by step · Pomodoro Santi", version="1.0.0", lifespan=lifespan)
app.add_exception_handler(ApplicationError, application_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[v.strip() for v in settings.cors_origins.split(",") if v.strip()],
    allow_methods=["GET", "POST", "PUT", "PATCH"],
    allow_headers=["Content-Type", "X-Step-Client", "X-Request-ID"],
    allow_credentials=True,
)
for router in (auth_router, focus_router):
    app.include_router(router, prefix="/api/v1")
    app.include_router(router, include_in_schema=False)


@app.middleware("http")
async def browser_protection_and_tracing(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    start = perf_counter()
    origin = request.headers.get("origin")
    if request.method in {"POST", "PUT", "DELETE", "PATCH"} and (
        request.headers.get("x-step-client") != "web"
        or (origin and origin.rstrip("/") != settings.app_origin.rstrip("/"))
    ):
        response = JSONResponse(
            {"detail": {"code": "ACCESS_DENIED", "message": "Solicitud no permitida."}},
            status_code=403,
        )
    else:
        response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        json.dumps(
            {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": round((perf_counter() - start) * 1000, 2),
            }
        )
    )
    return response


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready(db: DB):
    try:
        await db.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise ApplicationError(503, "La base de datos no está disponible.") from error
    return {"status": "ok"}
