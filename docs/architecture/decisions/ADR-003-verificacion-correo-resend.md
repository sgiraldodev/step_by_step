# ADR-003: códigos de correo y módulo independiente de envío

## Estado

Aceptado por solicitud explícita del usuario.

## Contexto y decisión

La recuperación necesita un método adicional por correo y el registro debe verificar la propiedad del correo antes de crear una cuenta. Ambos usan códigos aleatorios de cuatro dígitos (incluyendo ceros iniciales), asociados al correo y válidos durante tres minutos desde la aceptación del envío. La validación consume el código y entrega una autorización aleatoria de diez minutos para completar el formulario. Reenviar invalida el código y cualquier autorización anterior del mismo flujo.

El registro exige `verification_token`; es un cambio intencional de contrato. No se crea una cuenta ni se guarda una contraseña pendiente durante el envío del código. La autorización está asociada al correo normalizado y se consume al registrar la cuenta, dentro de la misma transacción. Las cuentas existentes y el código personal de recuperación se conservan. Cambiar contraseña revoca las sesiones y los métodos anteriores de recuperación.

Se añaden `POST /api/v1/auth/recovery-code`, `/recovery-code/verify`, `/registration-code` y `/registration-code/verify`. Los envíos reciben `email`; las validaciones reciben `email` y `code`. La recuperación informa cuando la cuenta no existe, según el requisito solicitado; esto permite conocer la existencia de una cuenta. El contrato histórico de enlaces conserva su respuesta genérica y vencimiento de treinta minutos.

Los códigos no se guardan en texto plano. `PasswordReset.purpose` distingue códigos de correo de autorizaciones opacas para impedir usar un código corto como enlace. La revisión `007` añade esa columna y `email_verifications`, sin eliminar ni reemplazar información existente. Los bloqueos de filas serializan validación y consumo en PostgreSQL.

## Integración y protección contra abuso

`app/integrations/email/service.py` expone `send_email`, `sender_address` e `is_configured`. Los módulos de negocio dependen de este contrato, y solo la integración selecciona un `EmailProvider`. Resend es el proveedor predeterminado; SMTP permanece como alternativa compatible. Un proveedor adicional implementa `send(EmailMessage)` y normaliza sus fallos como `EmailDeliveryError`. No se necesitan SDKs nuevos: el adaptador de Resend usa el cliente HTTP existente.

Configuración privada: `EMAIL_PROVIDER=resend`, `EMAIL_FROM` y `RESEND_API_KEY`. La API key nunca se entrega al navegador ni se incluye en respuestas. `onboarding@resend.dev` sirve para pruebas limitadas; para usuarios arbitrarios debe configurarse un remitente de un dominio verificado en Resend. Referencia: [API oficial de envío](https://resend.com/docs/api-reference/emails/send-email).

Se permiten cinco envíos por hora por dirección de cliente y por correo en cada flujo. La validación permite cinco intentos por correo cada tres minutos, además de veinte por dirección de cliente. Reenviar no reinicia el presupuesto de intentos. La restricción de correo se comparte entre direcciones de cliente. La verificación reduce registros automatizados, pero no reemplaza los límites del proxy, WAF o protección DDoS. La dirección usada es la observada por FastAPI; un proxy debe aplicar límites antes de reenviar tráfico y no confiar en cabeceras arbitrarias del cliente.

## Verificación y reversión

Las pruebas aíslan datos y proveedor: validan caducidad, cuenta asociada, ceros iniciales, reenvío, consumo, autorización de registro, límites y fallos de envío. El transporte de Resend se prueba con respuestas simuladas, sin enviar correos reales. La migración es aditiva y su downgrade evita eliminar información automáticamente.
