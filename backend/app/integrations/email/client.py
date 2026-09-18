import logging
import smtplib

from app.core.config import settings


def send_reset_email(host, message):
    try:
        with smtplib.SMTP(host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_starttls:
                smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException):
        logging.getLogger("step.auth").warning(
            "No fue posible enviar un correo de recuperación. Revisa la configuración SMTP."
        )
