from fastapi.testclient import TestClient

from app.main import app
from tests.test_auth_workspaces import HEADERS, signup


def test_color_is_private_and_survives_login(client):
    assert client.get("/api/v1/auth/me").json()["app_color"] == "blue"
    assert (
        client.patch("/api/v1/auth/preferences", json={"app_color": "pink"}).json()["app_color"]
        == "pink"
    )
    with TestClient(app, headers=HEADERS) as second:
        assert signup(second)["user"]["app_color"] == "blue"
        assert (
            second.patch("/api/v1/auth/preferences", json={"app_color": "green"}).status_code == 200
        )
        assert second.get("/api/v1/auth/me").json()["app_color"] == "green"
    assert client.get("/api/v1/auth/me").json()["app_color"] == "pink"
    client.post("/auth/logout")
    response = client.post(
        "/auth/login", json={"email": "test@example.test", "password": "A-test-password-2026"}
    )
    assert response.json()["app_color"] == "pink"
    assert (
        client.patch("/api/v1/auth/preferences", json={"app_color": "violet"}).json()["app_color"]
        == "violet"
    )


def test_color_requires_session_and_valid_value(client):
    for payload in [{"app_color": "unknown"}, {"app_color": "pink", "user_id": "other"}]:
        assert client.patch("/api/v1/auth/preferences", json=payload).status_code == 422
    assert client.get("/auth/me").json()["app_color"] == "blue"
    with TestClient(app, headers=HEADERS) as anonymous:
        assert (
            anonymous.patch("/api/v1/auth/preferences", json={"app_color": "pink"}).status_code
            == 401
        )
