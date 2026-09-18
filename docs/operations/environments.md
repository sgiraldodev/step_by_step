# Ambientes

## Objetivo

Definir una separación clara entre ambientes y evitar configuraciones ambiguas o credenciales compartidas incorrectamente.

## Ambientes estándar

- **development:** desarrollo local e integración temprana;
- **staging:** validación funcional y técnica antes de producción;
- **production:** ambiente productivo para usuarios reales.

## Configuración

- usar variables de entorno;
- mantener `.env.example` sin valores sensibles;
- no reutilizar credenciales productivas en development o staging;
- documentar variables obligatorias y opcionales;
- mantener diferencias entre ambientes al mínimo necesario;
- administrar configuración centralmente desde `core/config.py` usando `pydantic-settings` en backend.

## Secretos

Ningún secreto real debe quedar hardcodeado ni versionado en el repositorio.

En CI/CD deben utilizarse gestores de secretos del entorno, incluyendo GitHub Secrets y GitHub Environments cuando aplique.

Los secretos deben mantenerse separados por ambiente, incluyendo al menos:

- credenciales de base de datos;
- claves JWT;
- tokens y API keys de terceros;
- credenciales de despliegue;
- claves de almacenamiento;
- cualquier otro valor sensible.

## Datos

No utilizar datos reales sensibles en ambientes no productivos salvo que exista autorización y protección adecuada.

## Servicios externos

Cuando sea posible, utilizar credenciales, endpoints o sandboxes separados por ambiente.
