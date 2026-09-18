from datetime import date, datetime, timezone
from uuid import uuid4

from app.core import domain as main
from app.core.config import settings
from app.core.domain import LEGACY_OWNER_ID
from app.integrations.email import client as email_client
from app.modules.focus.models import CycleReceipt
from tests.database import SessionLocal


def label(client, name, color="#2563eb"):
    response = client.post("/tags", json={"name": name, "color": color})
    assert response.status_code == 201
    return response.json()


def resolve(client, task, seconds, finished=False):
    path = f"/tasks/{task['id']}"
    assert client.put(path, json={"action": "start"}).status_code == 200
    payload = {
        "action": "resolve",
        "finished": finished,
        "operation_id": str(uuid4()),
        "seconds": seconds,
    }
    response = client.put(path, json=payload)
    assert response.status_code == 200
    assert (
        client.put(path, json=payload).json()["cycles_invested"]
        == response.json()["cycles_invested"]
    )
    assert client.put(path, json={**payload, "seconds": seconds + 1}).status_code == 409
    return payload["operation_id"]


def test_reusable_tags_and_validation(client):
    personal = label(client, "Personales")
    assert label(client, " personales ", "#dc2626")["id"] == personal["id"]
    assert len(client.get("/tags").json()) == 1
    for title in ["Leer", "Ejercicio"]:
        task = client.post(
            "/tasks", json={"title": title, "tag_ids": [personal["id"], personal["id"]]}
        ).json()
        assert task["tags"] == [personal]
    assert client.post("/tags", json={"name": "x", "color": "red"}).status_code == 422
    assert client.post("/tasks", json={"title": "x", "tag_ids": [str(uuid4())]}).status_code == 422
    assert (
        client.post("/tasks", json={"title": "x", "tag_ids": [str(uuid4())] * 11}).status_code
        == 422
    )
    task = client.get("/tasks").json()[0]
    assert client.put(f"/tasks/{task['id']}", json={"tag_ids": []}).json()["tags"] == []
    assert client.put(f"/tasks/{task['id']}", json={"tag_ids": None}).status_code == 422
    assert (
        client.put(f"/tasks/{task['id']}", json={"action": "start", "seconds": 1}).status_code
        == 422
    )


def test_statistics_duration_split_snapshot_and_dates(client):
    a = label(client, "Laborales")
    b = label(client, "Personales", "#7c3aed")
    task = client.post("/tasks", json={"title": "Planear", "tag_ids": [a["id"], b["id"]]}).json()
    first = resolve(client, task, 600)
    client.put(f"/tasks/{task['id']}", json={"tag_ids": [a["id"]]})
    second = resolve(client, task, 120, True)
    untagged = client.post("/tasks", json={"title": "Sin clasificar"}).json()
    third = resolve(client, untagged, 180, True)
    with SessionLocal() as db:
        # UTC boundary: 04:59 is previous day in Colombia; 05:00 is next day.
        db.get(CycleReceipt, first).completed_at = datetime(2026, 9, 18, 4, 59, tzinfo=timezone.utc)
        db.get(CycleReceipt, second).completed_at = datetime(2026, 9, 18, 5, 0, tzinfo=timezone.utc)
        db.get(CycleReceipt, third).completed_at = datetime(2026, 9, 18, 6, 0, tzinfo=timezone.utc)
        db.commit()
    base = "/statistics?date_from=2026-09-17&date_to=2026-09-18"
    result = client.get(base).json()
    assert result["total_seconds"] == 900 and result["blocks"] == 3 and result["tasks"] == 2
    groups = {row["name"]: row["seconds"] for row in result["by_tag"]}
    assert groups == {"Laborales": 420, "Personales": 300, "Sin etiqueta": 180}
    assert sum(groups.values()) == result["total_seconds"]
    assert result["by_day"] == [
        {"date": "2026-09-17", "seconds": 600},
        {"date": "2026-09-18", "seconds": 300},
    ]
    assert client.get(base + f"&tag_id={b['id']}").json()["total_seconds"] == 600
    assert (
        client.get("/statistics?date_from=2026-09-17&date_to=2026-09-17").json()["total_seconds"]
        == 600
    )
    assert client.get("/statistics?date_from=2026-09-19&date_to=2026-09-19").json()["blocks"] == 0
    assert client.get("/statistics?date_from=2026-09-19&date_to=2026-09-17").status_code == 422


def test_routine_labels_inherit_and_preserve_old_days(client, monkeypatch):
    a = label(client, "Hábitos")
    b = label(client, "Salud", "#15803d")
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 17))
    routine = client.post("/routines", json={"title": "Caminar", "tag_ids": [a["id"]]}).json()
    old = client.get("/routines").json()["today_tasks"][0]
    assert old["tags"] == [a]
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 18))
    current = client.get("/routines").json()["today_tasks"][0]
    client.put(f"/routines/{routine['id']}", json={"tag_ids": [b["id"]]})
    assert client.get(f"/tasks/{current['id']}").json()["tags"] == [b]
    assert client.get(f"/tasks/{old['id']}").json()["tags"] == [a]
