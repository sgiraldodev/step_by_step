from email.message import EmailMessage
from uuid import uuid4

import httpx

from app.integrations.email.contracts import EmailDeliveryError


class ResendProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def send(self, message: EmailMessage) -> None:
        try:
            with httpx.Client(timeout=10) as client:
                response = client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Idempotency-Key": str(uuid4()),
                    },
                    json={
                        "from": str(message["From"]),
                        "to": [str(message["To"])],
                        "subject": str(message["Subject"]),
                        "text": message.get_content(),
                    },
                )
                if response.status_code == 403:
                    try:
                        detail = response.json().get("message", "")
                    except (ValueError, AttributeError):
                        detail = ""
                    if isinstance(detail, str) and "only send testing emails" in detail.lower():
                        raise EmailDeliveryError(
                            "El servicio de correo está en modo de pruebas y solo permite enviar "
                            "al correo asociado a la cuenta del proveedor. Para registrar otros "
                            "usuarios, el administrador debe configurar un dominio verificado."
                        )
                    raise EmailDeliveryError(
                        "El servicio de correo no permite este envío. El administrador debe "
                        "revisar los permisos y el dominio del remitente."
                    )
                response.raise_for_status()
                if not response.json().get("id"):
                    raise EmailDeliveryError("El proveedor no confirmó el envío.")
        except (httpx.HTTPError, ValueError) as exc:
            raise EmailDeliveryError("No se pudo enviar el correo.") from exc
