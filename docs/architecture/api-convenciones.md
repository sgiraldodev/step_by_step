# Convenciones de API

## Objetivo

Definir un contrato uniforme para las APIs REST del proyecto y evitar que cada módulo implemente rutas, paginación, errores u operaciones masivas de forma diferente.

## Versionado

Toda API debe nacer versionada desde el inicio:

```text
/api/v1/...
```

Una nueva versión, por ejemplo `/api/v2`, solo debe introducirse ante cambios incompatibles de contrato.

## Nombres de recursos

- Usar sustantivos en plural.
- Usar minúsculas.
- Evitar verbos en las rutas.
- Usar `kebab-case` cuando una ruta requiera varias palabras.

Ejemplo:

```text
GET    /api/v1/customers
GET    /api/v1/customers/{id}
POST   /api/v1/customers
PATCH  /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
```

## Actualizaciones individuales

`PATCH` es el método estándar para actualizaciones parciales.

`PUT` queda reservado para reemplazos completos de un recurso cuando ese comportamiento sea realmente necesario.

## Actualizaciones masivas por ID

Convención:

```text
PATCH /api/v1/customers/bulk
```

Todos los registros deben identificarse explícitamente por UUID.

Cuando todos reciben los mismos cambios:

```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"],
  "changes": {
    "is_active": false
  }
}
```

Cuando cada registro recibe cambios diferentes:

```json
{
  "items": [
    {
      "id": "uuid-1",
      "changes": {"name": "Cliente A"}
    },
    {
      "id": "uuid-2",
      "changes": {"name": "Cliente B"}
    }
  ]
}
```

## Creación masiva

Los módulos que necesiten crear varios recursos en una sola operación deben utilizar una ruta masiva explícita:

```text
POST /api/v1/customers/bulk
```

Payload recomendado:

```json
{
  "items": [
    {
      "name": "Cliente A",
      "email": "a@example.com"
    },
    {
      "name": "Cliente B",
      "email": "b@example.com"
    }
  ]
}
```

### Reglas para creación masiva

- Cada elemento debe validarse con el schema de creación correspondiente o uno específico para bulk cuando sea necesario.
- El service es responsable de validar reglas de negocio, duplicados, permisos y dependencias.
- Deben definirse límites razonables de registros por request cuando el volumen pueda afectar rendimiento.
- Por defecto, una creación masiva de negocio debe tratarse como una operación atómica: si un elemento falla y la regla funcional exige consistencia total, se ejecuta rollback completo.
- Si un caso de uso admite éxito parcial, ese comportamiento debe declararse explícitamente en el contrato y documentarse.
- La respuesta debe indicar claramente los registros creados y, cuando se permita éxito parcial, los registros rechazados con su código de error.
- No se deben sustituir operaciones masivas naturales por múltiples llamadas individuales desde el frontend.

## Paginación, filtros y ordenamiento

Usar `page` y `page_size` para colecciones paginadas.

Los filtros, búsqueda y ordenamiento se expresan mediante query params.

Ejemplo:

```text
GET /api/v1/customers?page=1&page_size=20&search=juan&sort_by=name&sort_order=asc
```

Respuesta estándar:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 125,
  "pages": 7
}
```

## Respuestas exitosas

Las respuestas exitosas deben ser REST directas y evitar envoltorios genéricos innecesarios.

## Errores

Formato recomendado:

```json
{
  "detail": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Cliente no encontrado"
  }
}
```

Los códigos internos deben ser estables y reutilizables por frontend, logs, observabilidad y soporte.
