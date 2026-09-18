from typing import Annotated

from fastapi import Depends, Request

from app.core.config import settings
from app.core.database import DB
from app.modules.auth.models import User
from app.modules.auth.service import AuthService


async def require_user(request: Request, db: DB):
    return await AuthService.current_user(db, request.cookies.get(settings.session_cookie_name, ""))


CurrentUser = Annotated[User, Depends(require_user)]
