from uuid import uuid4

from fastapi.testclient import TestClient

from app.core import domain
from app.main import app
from tests.email_verification import verified_email


def make_task(client, title="Tarea", tag_ids=None):
    response = client.post("/tasks", json={"title": title, "tag_ids": tag_ids or []})
    assert response.status_code == 201
    return response.json()["id"]


def record_time(client, task_id, finished=False):
    assert client.patch(f"/tasks/{task_id}", json={"action": "start"}).status_code == 200
    assert (
        client.patch(
            f"/tasks/{task_id}",
            json={
                "action": "resolve",
                "finished": finished,
                "seconds": 120,
                "operation_id": str(uuid4()),
            },
        ).status_code
        == 200
    )


def statistics(client):
    today = domain.business_date().isoformat()
    return client.get(f"/statistics?date_from={today}&date_to={today}").json()


def test_delete_pending_and_in_progress_task_with_its_history(client):
    tag = client.post("/tags", json={"name": "Trabajo", "color": "#2563eb"}).json()
    first = make_task(client, "Pendiente", [tag["id"]])
    second = make_task(client, "En progreso")
    record_time(client, second)
    completed = make_task(client, "Terminada")
    record_time(client, completed, finished=True)

    assert client.delete(f"/tasks/{first}").status_code == 204
    assert client.delete(f"/tasks/{second}").status_code == 204
    assert client.delete(f"/tasks/{completed}").status_code == 409
    assert client.delete(f"/tasks/{first}").status_code == 404
    assert [task["id"] for task in client.get("/tasks").json()] == [completed]
    assert [item["id"] for item in client.get("/tags").json()] == [tag["id"]]
    assert statistics(client)["total_seconds"] == 120


def test_clear_workspace_keeps_only_tags_when_selected(client):
    tag = client.post("/tags", json={"name": "Trabajo", "color": "#2563eb"}).json()
    task_id = make_task(client, tag_ids=[tag["id"]])
    record_time(client, task_id)
    routine = client.post("/routines", json={"title": "Leer", "tag_ids": [tag["id"]]}).json()
    daily = client.get("/routines").json()["today_tasks"][0]
    assert client.delete(f"/tasks/{daily['id']}").status_code == 409
    assert statistics(client)["total_seconds"] == 120

    assert client.delete("/focus-data?keep_tags=invalid").status_code == 422
    assert client.get(f"/tasks/{task_id}").status_code == 200

    assert client.delete("/focus-data?keep_tags=true").status_code == 204
    assert client.get("/tasks").json() == []
    assert client.get("/routines").json()["items"] == []
    assert client.get(f"/routines/{routine['id']}/history").status_code == 404
    assert [item["id"] for item in client.get("/tags").json()] == [tag["id"]]
    assert statistics(client)["total_seconds"] == 0
    assert statistics(client)["has_legacy_effort"] is False
    assert client.get("/auth/me").status_code == 200

    make_task(client, tag_ids=[tag["id"]])
    assert client.delete("/focus-data").status_code == 204
    assert client.get("/tags").json() == []
    assert client.get("/tasks").json() == []


def test_deletion_is_private_and_requires_authentication(client):
    first = make_task(client, "Propia")
    with TestClient(app, headers={"X-Step-Client": "web"}) as second:
        email = "otra-persona@example.test"
        assert (
            second.post(
                "/auth/register",
                json={
                    "name": "Otra persona",
                    "email": email,
                    "password": "A-test-password-2026",
                    "verification_token": verified_email(email),
                },
            ).status_code
            == 201
        )
        own = make_task(second, "Segunda cuenta")
        assert second.delete(f"/tasks/{first}").status_code == 404
        assert second.delete("/focus-data").status_code == 204
        assert second.get(f"/tasks/{own}").status_code == 404
    assert client.get(f"/tasks/{first}").status_code == 200
    assert (
        client.delete(f"/tasks/{first}", headers={"Origin": "https://evil.example"}).status_code
        == 403
    )
    with TestClient(app, headers={"X-Step-Client": "web"}) as anonymous:
        assert anonymous.delete(f"/tasks/{first}").status_code == 401
        assert anonymous.delete("/focus-data").status_code == 401
