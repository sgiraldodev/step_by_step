from datetime import date
from uuid import uuid4

from app.core import domain as main
from app.core.config import settings
from app.core.domain import LEGACY_OWNER_ID
from app.integrations.email import client as email_client


def create_routine(client, title="Leer"):
    response = client.post("/routines", json={"title": title, "priority": "Baja"})
    assert response.status_code == 201
    return response.json()["id"]


def test_daily_reset_preserves_history_and_does_not_duplicate(client, monkeypatch):
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 17))
    routine_id = create_routine(client)
    today = client.get("/routines").json()
    assert today["time_zone"] == "America/Bogota"
    task = today["today_tasks"][0]
    assert task["routine_id"] == routine_id
    assert task["status"] == "Pendiente"
    assert client.get("/tasks").json() == []
    assert (
        client.put(f"/tasks/{task['id']}", json={"action": "check"}).json()["cycles_invested"] == 0
    )
    for _ in range(3):
        items = client.get("/routines").json()["today_tasks"]
        assert len(items) == 1 and items[0]["id"] == task["id"]
        assert items[0]["status"] == "Terminada"
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 18))
    tomorrow = client.get("/routines").json()["today_tasks"][0]
    assert tomorrow["id"] != task["id"]
    assert tomorrow["status"] == "Pendiente" and tomorrow["cycles_invested"] == 0
    history = client.get(f"/routines/{routine_id}/history").json()
    assert [(item["routine_date"], item["status"]) for item in history] == [
        ("2026-09-18", "Pendiente"),
        ("2026-09-17", "Terminada"),
    ]
    assert client.put(f"/tasks/{task['id']}", json={"action": "uncheck"}).status_code == 409


def test_check_uncheck_and_pause_are_not_fake_pomodoros(client):
    routine_id = create_routine(client, "Almorzar")
    task = client.get("/routines").json()["today_tasks"][0]
    path = f"/tasks/{task['id']}"
    for _ in range(2):
        result = client.put(path, json={"action": "check"}).json()
        assert result["status"] == "Terminada" and result["cycles_invested"] == 0
    assert client.put(path, json={"action": "uncheck"}).json()["status"] == "Pendiente"
    client.put(path, json={"action": "start"})
    result = client.put(
        path, json={"action": "resolve", "finished": True, "operation_id": str(uuid4())}
    ).json()
    assert result["cycles_invested"] == 1 and result["status"] == "Terminada"
    assert client.put(path, json={"action": "uncheck"}).json()["cycles_invested"] == 1
    assert client.put(path, json={"action": "check"}).json()["cycles_invested"] == 1
    client.put(f"/routines/{routine_id}", json={"active": False})
    assert client.get("/routines").json()["today_tasks"] == []
    assert client.get("/routines").json()["items"][0]["active"] is False
    assert client.put(path, json={"action": "uncheck"}).status_code == 409
    client.put(f"/routines/{routine_id}", json={"active": True})
    restored = client.get("/routines").json()["today_tasks"][0]
    assert restored["id"] == task["id"] and restored["status"] == "Terminada"


def test_inactive_routine_and_snapshot_editing(client, monkeypatch):
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 17))
    routine_id = create_routine(client)
    old = client.get("/routines").json()["today_tasks"][0]
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 18))
    new = client.get("/routines").json()["today_tasks"][0]
    response = client.put(
        f"/routines/{routine_id}", json={"title": "Leer 20 páginas", "priority": "Alta"}
    )
    assert response.status_code == 200
    assert client.get(f"/tasks/{old['id']}").json()["title"] == "Leer"
    assert client.get(f"/tasks/{new['id']}").json()["title"] == "Leer 20 páginas"
    client.put(f"/routines/{routine_id}", json={"active": False})
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 19))
    assert client.get("/routines").json()["today_tasks"] == []
    assert len(client.get(f"/routines/{routine_id}/history").json()) == 2
    client.put(f"/routines/{routine_id}", json={"active": True})
    assert client.get("/routines").json()["today_tasks"][0]["status"] == "Pendiente"


def test_overnight_block_keeps_previous_day_effort(client, monkeypatch):
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 17))
    routine_id = create_routine(client)
    old = client.get("/routines").json()["today_tasks"][0]
    path = f"/tasks/{old['id']}"
    client.put(path, json={"action": "start"})
    monkeypatch.setattr(main, "business_date", lambda: date(2026, 9, 18))
    new = client.get("/routines").json()["today_tasks"][0]
    result = client.put(
        path, json={"action": "resolve", "finished": True, "operation_id": str(uuid4())}
    ).json()
    assert result["routine_date"] == "2026-09-17" and result["cycles_invested"] == 1
    assert client.get(f"/tasks/{new['id']}").json()["cycles_invested"] == 0
    assert len(client.get(f"/routines/{routine_id}/history").json()) == 2
    assert client.put(path, json={"action": "start"}).status_code == 409


def test_routine_validation_and_normal_task_checks(client):
    assert client.post("/routines", json={"title": "   "}).status_code == 422
    assert client.put("/routines/999", json={"active": False}).status_code == 404
    routine_id = create_routine(client)
    assert client.put(f"/routines/{routine_id}", json={"active": None}).status_code == 422
    normal = client.post("/tasks", json={"title": "Una sola vez"}).json()
    assert client.put(f"/tasks/{normal['id']}", json={"action": "check"}).status_code == 409
