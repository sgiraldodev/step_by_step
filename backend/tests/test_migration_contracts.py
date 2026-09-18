import hashlib

from fastapi.testclient import TestClient

from app.core.security import hash_password, verify_password
from app.main import app


def test_versioned_api_and_patch_preserve_original_contracts(client):
    task = client.post("/api/v1/tasks", json={"title": "Contrato migrado"}).json()
    response = client.patch(f"/api/v1/tasks/{task['id']}", json={"action": "start"})
    assert response.json()["status"] == "En Progreso"
    assert client.get(f"/tasks/{task['id']}").json() == response.json()
    assert response.headers["X-Request-ID"]
    paths = app.openapi()["paths"]
    assert "/tasks" not in paths
    assert "patch" in paths["/api/v1/tasks/{task_id}"]
    assert "put" not in paths["/api/v1/tasks/{task_id}"]


def test_errors_and_health_are_consistent(client):
    missing = client.get("/api/v1/tasks/999").json()
    assert missing["detail"]["code"] == "RESOURCE_NOT_FOUND"
    assert (
        client.post("/api/v1/tasks", json={"title": ""}).json()["detail"]["code"]
        == "VALIDATION_ERROR"
    )
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ready").json() == {"status": "ok"}
    with TestClient(app) as anonymous:
        assert anonymous.post("/api/v1/auth/logout").json()["detail"]["code"] == "ACCESS_DENIED"


def test_argon2_and_legacy_passwords_remain_compatible():
    password = "Clave-compatible-2026"
    encoded = hash_password(password)
    assert encoded.startswith("$argon2id$")
    assert verify_password(password, encoded)
    assert not verify_password("incorrecta", encoded)
    salt = bytes.fromhex("ab" * 16)
    legacy = hashlib.scrypt(
        password.encode(), salt=salt, n=16384, r=8, p=5, maxmem=64 * 1024 * 1024
    ).hex()
    assert verify_password(password, f"scrypt${salt.hex()}${legacy}")
    assert not verify_password(password, "invalid")
    assert not verify_password(password, "other$salt$hash")


def test_registration_validation_identifies_fields_without_echoing_credentials(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "   ", "email": "test@example.test", "password": "corta"},
    )
    assert response.status_code == 422
    message = response.json()["detail"]["message"]
    assert "de 1 a 100" in message
    assert "entre 10 y 128" in message
    assert "Nombre Apellido" not in message
    assert "corta" not in message
