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
