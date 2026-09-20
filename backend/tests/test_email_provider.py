import json
from email.message import EmailMessage

import httpx
import pytest

from app.core.config import settings
from app.integrations.email import resend, service
from app.integrations.email.contracts import EmailDeliveryError


def message():
    result = EmailMessage()
    result["From"] = "step@example.test"
    result["To"] = "persona@example.test"
    result["Subject"] = "Código"
    result.set_content("Código: 0123")
    return result


def transport(monkeypatch, handler):
    client_type = httpx.Client
    monkeypatch.setattr(
        resend.httpx,
        "Client",
        lambda **kwargs: client_type(transport=httpx.MockTransport(handler), **kwargs),
    )


def test_resend_contract_uses_private_key_and_public_email_service(monkeypatch):
    monkeypatch.setattr(settings, "email_provider", "resend")
    monkeypatch.setattr(settings, "resend_api_key", "fake-test-key")
    monkeypatch.setattr(settings, "email_from", "step@example.test")

    def handler(request):
        assert request.url == "https://api.resend.com/emails"
        assert request.headers["Authorization"] == "Bearer fake-test-key"
        assert request.headers["Idempotency-Key"]
        assert json.loads(request.content) == {
            "from": "step@example.test",
            "to": ["persona@example.test"],
            "subject": "Código",
            "text": "Código: 0123\n",
        }
        return httpx.Response(200, json={"id": "fake-email"})

    transport(monkeypatch, handler)
    assert service.is_configured()
    service.send_email(message())


@pytest.mark.parametrize(
    "status,body", [(401, {"message": "secret"}), (429, {}), (500, {}), (200, {})]
)
def test_provider_failure_is_normalized(monkeypatch, status, body):
    transport(monkeypatch, lambda request: httpx.Response(status, json=body))
    with pytest.raises(EmailDeliveryError) as error:
        resend.ResendProvider("fake").send(message())
    assert "secret" not in str(error.value)


def test_provider_timeout_and_missing_configuration(monkeypatch):
    def timeout(request):
        raise httpx.ReadTimeout("fallo privado", request=request)

    transport(monkeypatch, timeout)
    with pytest.raises(EmailDeliveryError):
        resend.ResendProvider("fake").send(message())
    monkeypatch.setattr(settings, "resend_api_key", "")
    monkeypatch.setattr(settings, "email_provider", "resend")
    assert not service.is_configured()
    with pytest.raises(EmailDeliveryError):
        service.send_email(message())


def test_testing_domain_restriction_is_explained_without_exposing_provider_details(monkeypatch):
    transport(
        monkeypatch,
        lambda request: httpx.Response(
            403,
            json={
                "message": "You can only send testing emails to your own email address (private@example.test)."
            },
        ),
    )
    with pytest.raises(EmailDeliveryError) as error:
        resend.ResendProvider("fake").send(message())
    assert "modo de pruebas" in str(error.value)
    assert "dominio verificado" in str(error.value)
    assert "private@example.test" not in str(error.value)


def test_other_forbidden_delivery_does_not_expose_provider_details(monkeypatch):
    transport(monkeypatch, lambda request: httpx.Response(403, json={"message": "private details"}))
    with pytest.raises(EmailDeliveryError) as error:
        resend.ResendProvider("fake").send(message())
    assert "dominio del remitente" in str(error.value)
    assert "private details" not in str(error.value)
