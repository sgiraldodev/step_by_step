# Integraciones externas

## Objetivo

Definir cómo deben integrarse servicios externos para evitar acoplamiento, SDKs dispersos y llamadas HTTP directas desde capas que no corresponden.

## Regla general

Las integraciones externas deben encapsularse bajo `app/integrations/`.

Ejemplos:

```text
app/
├── integrations/
│   ├── whatsapp/
│   ├── email/
│   ├── payments/
│   └── storage/
└── modules/
```

## Responsabilidades

- `router.py` no debe consumir SDKs externos ni ejecutar llamadas HTTP a terceros.
- `repository.py` no debe integrar servicios externos; su responsabilidad es persistencia.
- `service.py` coordina la regla de negocio y el uso de una integración cuando la operación lo requiera.
- La implementación concreta del proveedor externo vive dentro de `app/integrations/`.

## Principio de desacoplamiento

Un módulo de negocio debe depender de una interfaz o contrato estable de integración, no de detalles específicos del proveedor cuando sea razonable.

Esto permite reemplazar proveedores, simular integraciones en pruebas y mantener separada la lógica de negocio de detalles de infraestructura.

## Configuración

Credenciales, URLs, tokens y demás valores sensibles deben obtenerse desde la configuración centralizada de la aplicación y nunca quedar hardcodeados en los módulos.

## Manejo de errores

Las excepciones técnicas del SDK o proveedor externo no deben propagarse sin control hasta la API. La capa de integración debe traducirlas a errores propios y el servicio decidir cómo afectan la operación de negocio.

## Observabilidad

Las integraciones deben participar en la trazabilidad de la aplicación utilizando el `request_id` o `correlation_id` cuando aplique, sin registrar secretos o información sensible.

## Módulo de correo implementado

Import público: `app.integrations.email.service`. `send_email(EmailMessage)` confirma la aceptación del envío o lanza `EmailDeliveryError`; `sender_address()` obtiene el remitente configurado e `is_configured()` valida la configuración mínima. El contenido y las reglas de expiración pertenecen a autenticación. Los adaptadores implementan `EmailProvider` y viven exclusivamente en esta integración. Resend usa `RESEND_API_KEY` y `EMAIL_FROM`; `EMAIL_PROVIDER=smtp` selecciona el transporte SMTP existente. No debe importarse el adaptador de Resend desde módulos de negocio. Véase [ADR-003](decisions/ADR-003-verificacion-correo-resend.md).

Los errores del adaptador contienen mensajes controlados y aptos para mostrar al usuario, sin copiar respuestas del proveedor. Ante un 403 de Resend, se distingue la restricción de destinatarios del dominio de pruebas de otros problemas de permisos o del remitente. Autenticación conserva ese mensaje en su respuesta 503. El dominio `resend.dev` solo permite pruebas hacia el correo asociado a la cuenta de Resend; para registrar otros usuarios debe configurarse un remitente de un dominio propio verificado. [Restricción oficial](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
