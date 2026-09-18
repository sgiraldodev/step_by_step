import enum
from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.core.config import settings


class PriorityEnum(str, enum.Enum):
    baja = "Baja"
    media = "Media"
    alta = "Alta"
    urgente = "Urgente"


class StatusEnum(str, enum.Enum):
    pendiente = "Pendiente"
    en_progreso = "En Progreso"
    terminada = "Terminada"


APP_TIMEZONE = settings.app_timezone
BUSINESS_ZONE = ZoneInfo(APP_TIMEZONE)


def business_date() -> date:
    return datetime.now(BUSINESS_ZONE).date()


LEGACY_OWNER_ID = "00000000-0000-4000-8000-000000000001"
