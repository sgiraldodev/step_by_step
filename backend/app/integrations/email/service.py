import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.integrations.email.client import send_reset_email
from app.integrations.email.contracts import EmailDeliveryError, EmailProvider
from app.integrations.email.resend import ResendProvider


class SMTPProvider:
    def send(self, message: EmailMessage) -> None:
        try:
            send_reset_email(settings.smtp_host, message, raise_on_error=True)
        except (OSError, smtplib.SMTPException) as exc:
            raise EmailDeliveryError("No se pudo enviar el correo.") from exc


def sender_address() -> str:
    return settings.email_from if settings.email_provider == "resend" else settings.smtp_from


def is_configured() -> bool:
    credentials = (
        settings.resend_api_key if settings.email_provider == "resend" else settings.smtp_host
    )
    return bool(credentials and sender_address())


def send_email(message: EmailMessage) -> None:
    """Contrato público: entrega un mensaje o informa un fallo normalizado."""
    if not is_configured():
        raise EmailDeliveryError("El envío de correo no está configurado.")
    provider: EmailProvider = (
        ResendProvider(settings.resend_api_key)
        if settings.email_provider == "resend"
        else SMTPProvider()
    )
    provider.send(message)


def send_email_safely(message: EmailMessage) -> None:
    """Compatibilidad con envíos históricos ejecutados en segundo plano."""
    try:
        send_email(message)
    except EmailDeliveryError:
        logging.getLogger("step.email").warning("No fue posible enviar el correo.")
