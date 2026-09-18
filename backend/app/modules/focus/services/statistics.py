from datetime import date, datetime, time, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession as Session

from app.core.domain import APP_TIMEZONE, BUSINESS_ZONE
from app.core.exceptions import ApplicationError
from app.modules.focus.repository import (
    StatisticsRepository,
)


class StatisticsService:
    @staticmethod
    async def report(db: Session, date_from: date, date_to: date, tag_id: UUID | None):
        if date_from > date_to or (date_to - date_from).days > 366:
            raise ApplicationError(422, "Selecciona un rango válido de hasta 367 días.")
        start = datetime.combine(date_from, time.min, BUSINESS_ZONE).astimezone(timezone.utc)
        end = datetime.combine(date_to + timedelta(days=1), time.min, BUSINESS_ZONE).astimezone(
            timezone.utc
        )
        receipts = await StatisticsRepository.receipts(db, start, end)
        selected = str(tag_id) if tag_id else None
        if selected:
            receipts = [
                r for r in receipts if any((t["id"] == selected for t in r.tag_snapshot or []))
            ]
        groups, days = ({}, {})
        total = sum((r.seconds for r in receipts))
        for receipt in receipts:
            tags = receipt.tag_snapshot or [
                {"id": "untagged", "name": "Sin etiqueta", "color": "#7b8ba5"}
            ]
            for tag in tags:
                row = groups.setdefault(tag["id"], {**tag, "seconds": 0})
                row["seconds"] += receipt.seconds / len(tags)
            stamp = receipt.completed_at
            if stamp.tzinfo is None:
                stamp = stamp.replace(tzinfo=timezone.utc)
            day = stamp.astimezone(BUSINESS_ZONE).date().isoformat()
            days[day] = days.get(day, 0) + receipt.seconds
        legacy = await StatisticsRepository.total_cycles(
            db
        ) - await StatisticsRepository.recorded_cycles(db)
        return {
            "date_from": date_from,
            "date_to": date_to,
            "time_zone": APP_TIMEZONE,
            "total_seconds": total,
            "blocks": len(receipts),
            "tasks": len({r.task_id for r in receipts}),
            "by_tag": sorted(groups.values(), key=lambda row: -row["seconds"]),
            "by_day": [{"date": key, "seconds": value} for key, value in sorted(days.items())],
            "has_legacy_effort": legacy > 0,
        }
