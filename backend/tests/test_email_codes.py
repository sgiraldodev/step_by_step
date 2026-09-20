import re
import smtplib
from datetime import datetime, timedelta, timezone

import pytest

from app.core.config import settings
from app.integrations.email.contracts import EmailDeliveryError
from app.modules.auth import email_codes, email_recovery
from app.modules.auth.models import EmailVerification, PasswordReset, User
from tests.database import SessionLocal
from tests.test_auth_workspaces import signup


@pytest.fixture
def mail(monkeypatch):
    sent = []
    monkeypatch.setattr(settings, "email_provider", "smtp")
    monkeypatch.setattr(settings, "smtp_host", "fake")
    monkeypatch.setattr(settings, "smtp_from", "step@example.test")
    monkeypatch.setattr(email_codes, "send_email", lambda message: sent.append(message))
    return sent


def send(client, mail, path, email):
    result = client.post(path, json={"email": email})
    assert result.status_code == 200, result.text
    code = re.search(r"es: ([0-9]{4})", mail[-1].get_content()).group(1)
    expiry = datetime.fromisoformat(result.json()["expires_at"])
    assert 175 < (expiry - datetime.now(timezone.utc)).total_seconds() <= 180
    assert mail[-1]["To"] == email.lower()
    return code


def test_recovery_account_binding_single_use_and_password_change(client, mail, monkeypatch):
    signup(client)
    monkeypatch.setattr(email_recovery.secrets, "randbelow", lambda _: 7)
    code = send(client, mail, "/auth/recovery-code", "TEST@example.test")
    assert code == "0007"
    assert (
        client.post(
            "/auth/recovery-code/verify", json={"email": "seconduser@example.test", "code": code}
        ).status_code
        == 400
    )
    # Un código corto no puede eludir la validación usando el contrato de enlaces.
    with SessionLocal() as db:
        user = db.query(User).filter_by(email="test@example.test").one()
        forged_token = f"email-code:{user.id}:{code}"
    assert (
        client.post(
            "/auth/reset-password", json={"token": forged_token, "password": "New-password-2026"}
        ).status_code
        == 400
    )
    verified = client.post(
        "/auth/recovery-code/verify", json={"email": "test@example.test", "code": code}
    )
    assert verified.status_code == 200
    assert (
        client.post(
            "/auth/recovery-code/verify", json={"email": "test@example.test", "code": code}
        ).status_code
        == 400
    )
    payload = {"token": verified.json()["token"], "password": "New-password-2026"}
    assert client.post("/auth/reset-password", json=payload).status_code == 200
    assert client.post("/auth/reset-password", json=payload).status_code == 400
    assert (
        client.post(
            "/auth/login", json={"email": "test@example.test", "password": payload["password"]}
        ).status_code
        == 200
    )


def test_recovery_missing_expired_and_resend(client, mail, monkeypatch):
    assert (
        client.post("/auth/recovery-code", json={"email": "missing@example.test"}).status_code
        == 404
    )
    assert not mail
    values = iter([1234, 5678])
    monkeypatch.setattr(email_recovery.secrets, "randbelow", lambda _: next(values))
    old = send(client, mail, "/auth/recovery-code", "test@example.test")
    new = send(client, mail, "/auth/recovery-code", "test@example.test")
    assert (
        client.post(
            "/auth/recovery-code/verify", json={"email": "test@example.test", "code": old}
        ).status_code
        == 400
    )
    with SessionLocal() as db:
        db.query(PasswordReset).one().expires_at = datetime.now(timezone.utc)
        db.commit()
    assert (
        client.post(
            "/auth/recovery-code/verify", json={"email": "test@example.test", "code": new}
        ).status_code
        == 400
    )


def test_registration_requires_verified_same_email_and_consumes_token(client, mail):
    payload = {
        "name": "Nueva Persona",
        "email": "new@example.test",
        "password": "New-password-2026",
    }
    assert client.post("/auth/register", json=payload).status_code == 422
    assert (
        client.post(
            "/auth/register", json={**payload, "verification_token": "fake" * 10}
        ).status_code
        == 400
    )
    with SessionLocal() as db:
        assert db.query(User).count() == 1
    code = send(client, mail, "/auth/registration-code", payload["email"])
    verify = {"email": payload["email"], "code": code}
    result = client.post("/auth/registration-code/verify", json=verify)
    assert result.status_code == 200
    token = result.json()["token"]
    assert client.post("/auth/registration-code/verify", json=verify).status_code == 400
    assert (
        client.post(
            "/auth/register",
            json={**payload, "email": "other@example.test", "verification_token": token},
        ).status_code
        == 400
    )
    assert (
        client.post("/auth/register", json={**payload, "verification_token": token}).status_code
        == 201
    )
    with SessionLocal() as db:
        assert db.get(EmailVerification, payload["email"]).token_hash is None
    assert (
        client.post("/auth/registration-code", json={"email": payload["email"]}).status_code == 409
    )


def test_registration_expiry_and_attempt_limit(client, mail):
    email = "new@example.test"
    code = send(client, mail, "/auth/registration-code", email)
    with SessionLocal() as db:
        db.get(EmailVerification, email).expires_at = datetime.now(timezone.utc) - timedelta(
            seconds=1
        )
        db.commit()
    for _ in range(5):
        assert (
            client.post(
                "/auth/registration-code/verify", json={"email": email, "code": code}
            ).status_code
            == 400
        )
    assert (
        client.post(
            "/auth/registration-code/verify", json={"email": email, "code": code}
        ).status_code
        == 429
    )
    for _ in range(4):
        assert client.post("/auth/registration-code", json={"email": email}).status_code == 200
    assert client.post("/auth/registration-code", json={"email": email}).status_code == 429


@pytest.mark.parametrize(
    "path,email",
    [("/auth/recovery-code", "test@example.test"), ("/auth/registration-code", "new@example.test")],
)
def test_delivery_failure_does_not_activate_code(client, mail, monkeypatch, path, email):
    def fail(*args, **kwargs):
        raise EmailDeliveryError("fallo simulado")

    monkeypatch.setattr(email_codes, "send_email", fail)
    assert client.post(path, json={"email": email}).status_code == 503
    with SessionLocal() as db:
        assert db.query(PasswordReset).count() == 0
        assert db.get(EmailVerification, "new@example.test") is None
