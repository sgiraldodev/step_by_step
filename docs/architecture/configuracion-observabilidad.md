# Configuración, observabilidad y salud de la aplicación

## Configuración

Toda la configuración debe centralizarse en `app/core/config.py` utilizando `pydantic-settings`.

Reglas:

- No leer `os.getenv()` de forma dispersa en módulos funcionales.
- No hardcodear secretos ni credenciales.
- Mantener `.env.example` como referencia sin valores sensibles.
- Separar configuración por entorno.
- Validar tipos y valores obligatorios al iniciar la aplicación.

Variables típicas:

```text
DATABASE_URL
JWT_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS
APP_ENV
LOG_LEVEL
```

## Logging

La aplicación debe usar logs estructurados. En producción, JSON es el formato recomendado.

Cada request debe disponer de un `request_id` o `correlation_id` único que se propague a través de routers, services, repositories e integraciones externas cuando sea posible.

Esto permite correlacionar errores y eventos de un mismo flujo.

## Health checks

Se deben exponer al menos:

```text
GET /health
GET /ready
```

### `/health`

Indica que el proceso de aplicación está vivo.

### `/ready`

Indica que la aplicación está preparada para recibir tráfico.

Debe validar al menos la conectividad con PostgreSQL y, cuando aplique, otras dependencias críticas necesarias para operar.
