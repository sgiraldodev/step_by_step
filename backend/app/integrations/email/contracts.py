from email.message import EmailMessage
from typing import Protocol


class EmailDeliveryError(Exception):
    """Fallo de entrega independiente del proveedor y sin detalles sensibles."""


class EmailProvider(Protocol):
    def send(self, message: EmailMessage) -> None: ...
