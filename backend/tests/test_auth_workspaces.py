import re
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core import domain as main
from app.core.config import settings
from app.core.domain import LEGACY_OWNER_ID
from app.integrations.email import client as email_client
from app.main import app
from app.modules.auth.models import LoginSession, PasswordReset, User
from app.modules.focus.models import Task
from tests.database import SessionLocal
from tests.email_verification import verified_email

HEADERS = {"X-Step-Client": "web"}


def signup(client, username="seconduser"):
    response = client.post(
        "/auth/register",
        json={
            "name": "Nombre Apellido",
            "email": f"{username}@example.test",
            "verification_token": verified_email(f"{username}@example.test"),
            "password": "A-test-password-2026",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_every_workspace_endpoint_requires_session(client):
    with TestClient(app, headers=HEADERS) as anonymous:
        for path in [
            "/tasks",
            "/routines",
            "/tags",
            "/statistics?date_from=2026-09-17&date_to=2026-09-17",
            "/tasks/1",
            "/routines/1/history",
        ]:
            assert anonymous.get(path).status_code == 401
        assert anonymous.post("/tasks", json={"title": "x"}).status_code == 401


def test_private_tasks_routines_labels_and_statistics(client):
    tag = client.post("/tags", json={"name": "Personal", "color": "#2563eb"}).json()
    task = client.post("/tasks", json={"title": "Private task", "tag_ids": [tag["id"]]}).json()
    routine = client.post(
        "/routines", json={"title": "Private routine", "tag_ids": [tag["id"]]}
    ).json()
    client.put(f"/tasks/{task['id']}", json={"action": "start"})
    client.put(
        f"/tasks/{task['id']}",
        json={"action": "resolve", "finished": True, "seconds": 120, "operation_id": str(uuid4())},
    )
    with TestClient(app, headers=HEADERS) as second:
        signup(second)
        assert second.get("/tasks").json() == []
        assert second.get("/tags").json() == []
        assert second.get("/routines").json()["items"] == []
        assert second.get(f"/tasks/{task['id']}").status_code == 404
        for action in [
            {"tag_ids": []},
            {"action": "restore"},
            {"action": "start"},
            {"action": "interrupt", "seconds": 10, "operation_id": str(uuid4())},
        ]:
            assert second.put(f"/tasks/{task['id']}", json=action).status_code == 404
        assert second.put(f"/routines/{routine['id']}", json={"active": False}).status_code == 404
        assert second.get(f"/routines/{routine['id']}/history").status_code == 404
        assert second.post("/tasks", json={"title": "x", "tag_ids": [tag["id"]]}).status_code == 422
        assert (
            second.post("/routines", json={"title": "x", "tag_ids": [tag["id"]]}).status_code == 422
        )
        own = second.post("/tags", json={"name": "Personal", "color": "#dc2626"}).json()
        assert own["id"] != tag["id"]
        today = main.business_date().isoformat()
        stats = second.get(f"/statistics?date_from={today}&date_to={today}").json()
        assert stats["total_seconds"] == 0 and stats["has_legacy_effort"] is False
    assert client.get("/tasks").json()[0]["title"] == "Private task"


def test_logout_expiry_csrf_and_password_hash(client):
    me = client.get("/auth/me").json()
    with SessionLocal() as db:
        user = db.get(User, me["id"])
        assert (
            user.password_hash.startswith("$argon2id$")
            and "A-test-password" not in user.password_hash
        )
        session = db.query(LoginSession).filter_by(user_id=user.id).first()
        session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    assert client.get("/tasks").status_code == 401
    login = client.post(
        "/auth/login", json={"email": "test@example.test", "password": "A-test-password-2026"}
    )
    assert login.status_code == 200 and "HttpOnly" in login.headers["set-cookie"]
    assert (
        client.post(
            "/tasks", json={"title": "x"}, headers={"Origin": "https://evil.example"}
        ).status_code
        == 403
    )
    assert (
        client.post("/tasks", json={"title": "x"}, headers={"X-Step-Client": ""}).status_code == 403
    )
    assert client.post("/auth/logout").status_code == 200
    assert client.get("/tasks").status_code == 401


def test_recovery_code_single_use_rotates_and_revokes_sessions(client):
    with TestClient(app, headers=HEADERS) as second:
        registered = signup(second)
        code = registered["recovery_code"]
        data = {
            "email": "seconduser@example.test",
            "recovery_code": code,
            "password": "My-new-password-2026",
        }
        result = client.post("/auth/reset-password", json=data)
        assert result.status_code == 200 and result.json()["recovery_code"] != code
        assert second.get("/tasks").status_code == 401
        assert client.post("/auth/reset-password", json=data).status_code == 400
        assert (
            second.post(
                "/auth/login",
                json={"email": "seconduser@example.test", "password": "A-test-password-2026"},
            ).status_code
            == 401
        )
        assert (
            second.post(
                "/auth/login",
                json={"email": "seconduser@example.test", "password": "My-new-password-2026"},
            ).status_code
            == 200
        )


def test_email_recovery_generic_expiring_one_use_links(client, monkeypatch):
    sent = []

    class SMTP:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def starttls(self):
            pass

        def send_message(self, message):
            sent.append(message.get_content())

    monkeypatch.setattr(settings, "email_provider", "smtp")
    monkeypatch.setattr(settings, "smtp_host", "test-mail-server")
    monkeypatch.setattr(settings, "smtp_from", "test@example.test")
    monkeypatch.setattr(settings, "app_origin", "http://localhost:3100")
    monkeypatch.setattr(email_client.smtplib, "SMTP", SMTP)
    known = client.post("/auth/forgot-password", json={"email": "test@example.test"})
    unknown = client.post("/auth/forgot-password", json={"email": "missing@example.test"})
    assert known.json() == unknown.json() and len(sent) == 1
    token = re.search(r"#reset=([^\s]+)", sent[0]).group(1)
    data = {"token": token, "password": "Another-password-2026"}
    assert client.post("/auth/reset-password", json=data).status_code == 200
    assert client.post("/auth/reset-password", json=data).status_code == 400
    client.post("/auth/forgot-password", json={"email": "test@example.test"})
    with SessionLocal() as db:
        row = db.query(PasswordReset).first()
        row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    token = re.search(r"#reset=([^\s]+)", sent[-1]).group(1)
    assert client.post("/auth/reset-password", json={**data, "token": token}).status_code == 400


def test_original_data_requires_installation_secret(client, monkeypatch):
    monkeypatch.setattr(settings, "initial_setup_token", "isolated-installation-test-code")
    with SessionLocal() as db:
        db.add(User(id=LEGACY_OWNER_ID))
        db.flush()
        db.add(Task(owner_id=LEGACY_OWNER_ID, title="Original private data"))
        db.commit()
    assert client.get("/auth/status").json()["setup_required"] is True
    assert all(t["title"] != "Original private data" for t in client.get("/tasks").json())
    with TestClient(app, headers=HEADERS) as owner:
        payload = {
            "name": "Propietario original",
            "email": "owner@example.test",
            "verification_token": verified_email("owner@example.test"),
            "password": "Owner-password-2026",
            "setup_code": "wrong",
        }
        assert owner.post("/auth/register", json=payload).status_code == 403
        payload["setup_code"] = "isolated-installation-test-code"
        assert owner.post("/auth/register", json=payload).status_code == 201
        assert owner.get("/tasks").json()[0]["title"] == "Original private data"
        assert owner.post("/auth/register", json=payload).status_code == 409


def test_switch_and_restore_keep_effort_without_false_completion(client):
    task = client.post("/tasks", json={"title": "Switch me"}).json()
    path = f"/tasks/{task['id']}"
    client.put(path, json={"action": "start"})
    interrupt = {"action": "interrupt", "seconds": 35, "operation_id": str(uuid4())}
    for _ in range(2):
        result = client.put(path, json=interrupt).json()
        assert result["status"] == "Pendiente" and result["cycles_invested"] == 0
    client.put(path, json={"action": "start"})
    result = client.put(
        path,
        json={"action": "resolve", "finished": True, "seconds": 40, "operation_id": str(uuid4())},
    ).json()
    assert result["status"] == "Terminada" and result["cycles_invested"] == 1
    result = client.put(path, json={"action": "restore"}).json()
    assert result["status"] == "Pendiente" and result["cycles_invested"] == 1
    today = main.business_date().isoformat()
    report = client.get(f"/statistics?date_from={today}&date_to={today}").json()
    assert report["total_seconds"] == 75 and report["blocks"] == 2


def test_login_throttle(client):
    for _ in range(8):
        assert (
            client.post(
                "/auth/login", json={"email": "missing@example.test", "password": "incorrect"}
            ).status_code
            == 401
        )
    assert (
        client.post(
            "/auth/login", json={"email": "missing@example.test", "password": "incorrect"}
        ).status_code
        == 429
    )


def test_personal_names_can_repeat_and_email_is_the_only_login_identifier(client):
    with TestClient(app, headers=HEADERS) as account:
        payload = {
            "name": "  María José Giraldo  ",
            "email": "PERSONA@example.test",
            "verification_token": verified_email("persona@example.test"),
            "password": "  Password-with-spaces  ",
        }
        created = account.post("/api/v1/auth/register", json=payload)
        assert created.status_code == 201
        assert created.json()["user"]["name"] == "María José Giraldo"
        assert created.json()["user"]["email"] == "persona@example.test"
        assert "username" not in created.json()["user"]
        assert account.get("/api/v1/auth/me").json()["name"] == "María José Giraldo"
        account.post("/api/v1/auth/logout")
        assert (
            account.post(
                "/api/v1/auth/login",
                json={"email": "PERSONA@example.test", "password": payload["password"]},
            ).status_code
            == 200
        )
        assert (
            account.post(
                "/api/v1/auth/register",
                json={
                    **payload,
                    "email": "otra@example.test",
                    "verification_token": verified_email("otra@example.test"),
                },
            ).status_code
            == 201
        )
        assert account.post("/api/v1/auth/register", json=payload).status_code == 409
        assert (
            account.post(
                "/api/v1/auth/login",
                json={"username": "María José Giraldo", "password": payload["password"]},
            ).status_code
            == 422
        )
