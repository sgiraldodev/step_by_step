from email.message import EmailMessage

from starlette.concurrency import run_in_threadpool

from app.core.exceptions import ApplicationError
from app.integrations.email.contracts import EmailDeliveryError
from app.integrations.email.service import is_configured, send_email, sender_address

CODE_MINUTES = 3


async def deliver_code(email, code, purpose):
    if not is_configured():
        raise ApplicationError(503, "El envío de correo no está configurado.")
    message = EmailMessage()
    message["From"] = sender_address()
    message["To"] = email
    message["Subject"] = f"Código de {purpose} · Step by step"
    message.set_content(
        f"Tu código de {purpose} es: {code}\n\n"
        "Ingresa los 4 dígitos en Step by step. Vence en 3 minutos y solo puede "
        "usarse una vez.\n\nSi no lo solicitaste, ignora este correo."
    )
    try:
        await run_in_threadpool(send_email, message)
    except EmailDeliveryError as error:
        raise ApplicationError(503, str(error)) from error
