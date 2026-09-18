# Arquitectura

## Objetivo

Definir la estructura técnica del sistema, sus límites, responsabilidades, dependencias y decisiones principales.

## Arquitectura por defecto

El punto de partida es un **monolito modular**. Cada dominio funcional debe estar aislado en módulos claros, con dependencias explícitas y bajo acoplamiento.

La adopción de microservicios, eventos distribuidos u otras arquitecturas más complejas debe justificarse mediante ADR.

## Estructura estándar de cada módulo backend

Por defecto, cada módulo funcional debe ser compacto y mantener esta estructura:

```text
modules/
└── customers/
    ├── router.py
    ├── service.py
    ├── repository.py
    ├── models.py
    ├── schemas.py
    ├── dependencies.py
    └── exceptions.py
```

La estructura solo debe dividirse en subcarpetas cuando el crecimiento real del módulo haga que la estructura plana deje de ser clara.

## Responsabilidades por capa

### router.py

- Expone endpoints HTTP.
- Recibe parámetros, payloads y dependencias.
- Invoca el service correspondiente.
- Devuelve respuestas REST directas.
- No contiene reglas de negocio.
- No accede directamente a SQLAlchemy ni a repositories de otros módulos.

### service.py

- Contiene reglas de aplicación y orquestación del flujo de negocio.
- Coordina uno o varios repositories cuando sea necesario.
- Puede consumir servicios públicos de otros módulos.
- Controla la transacción de base de datos.
- No debe lanzar `HTTPException` directamente.
- Debe lanzar excepciones propias del proyecto o del módulo.

### repository.py

- Encapsula el acceso a persistencia.
- Ejecuta consultas y operaciones con SQLAlchemy.
- No contiene reglas de negocio.
- No hace `commit()` automáticamente.
- Trabaja con la sesión entregada por la capa superior.

Todo módulo con persistencia propia debe tener `repository.py`.

### models.py

- Contiene únicamente modelos de persistencia SQLAlchemy.
- Debe mantenerse separado de los schemas Pydantic.

### schemas.py

- Contiene contratos Pydantic de entrada y salida.
- Debe separar schemas por intención, por ejemplo:
  - `CustomerCreate`
  - `CustomerUpdate`
  - `CustomerRead`
  - `CustomerListItem`
- No reutilizar un único schema para creación, actualización y lectura cuando eso mezcle responsabilidades.

### dependencies.py

- Contiene dependencias específicas del módulo.
- Las dependencias transversales viven en `app/core/`.

### exceptions.py

- Contiene excepciones específicas del módulo.
- Las excepciones genéricas viven en `app/core/exceptions.py`.

## Core transversal

Como base, el backend debe contemplar:

```text
app/
├── core/
│   ├── database.py
│   ├── dependencies.py
│   ├── security.py
│   └── exceptions.py
└── modules/
```

En `core` viven responsabilidades transversales como:

- configuración de base de datos,
- sesión SQLAlchemy,
- autenticación,
- autorización general,
- usuario actual,
- excepciones genéricas,
- configuración compartida.

## Comunicación entre módulos

Un módulo puede consumir otro módulo **solo a través de su service público**.

Permitido:

```text
sales/service.py
        ↓
customers/service.py
```

No permitido:

```text
sales/service.py
        ↓
customers/repository.py
```

Tampoco se debe acceder directamente a las tablas o modelos internos de otro módulo salvo una excepción arquitectónica explícita y documentada.

## Manejo de respuestas HTTP

Las respuestas exitosas deben ser REST directas, sin envoltorios genéricos innecesarios.

Ejemplo:

```json
{
  "id": "123",
  "name": "Cliente X"
}
```

Los errores deben seguir un formato estandarizado, por ejemplo:

```json
{
  "detail": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Cliente no encontrado"
  }
}
```

Los códigos internos de error deben ser estables y reutilizables por frontend, observabilidad y soporte.

## Manejo de excepciones

Los services no deben lanzar `HTTPException` directamente.

Flujo esperado:

```text
repository
   ↓
service
   ↓
excepción propia
   ↓
manejador global
   ↓
respuesta HTTP
```

`app/core/exceptions.py` contendrá excepciones genéricas reutilizables, como errores de no encontrado, conflicto, validación o acceso prohibido.

Cada módulo podrá definir excepciones específicas en su propio `exceptions.py`.

## Persistencia y transacciones

PostgreSQL es la base de datos principal por defecto.

SQLAlchemy 2.x en modo asíncrono es el estándar de persistencia. Debe utilizarse `AsyncSession`.

La aplicación debe utilizar **una única sesión de base de datos por request**, compartida por todos los repositories que participen en esa operación.

Los repositories no hacen `commit()` automáticamente. El service controla la transacción completa y decide `commit()` o `rollback()` según el resultado del caso de uso.

Flujo de referencia:

```text
Request
  ↓
AsyncSession única
  ↓
Router
  ↓
Service
  ├── Repository A
  └── Repository B
  ↓
Commit / Rollback
```

Los cambios de esquema se gestionan mediante migraciones versionadas con Alembic.

## Entidades y auditoría

Las entidades principales de negocio deben usar UUID como clave primaria por defecto.

Campos base recomendados para entidades de negocio:

- `id: UUID`
- `created_at`
- `updated_at`
- `deleted_at`

Cuando la trazabilidad de usuario sea relevante, se pueden añadir:

- `created_by`
- `updated_by`
- `deleted_by`

## Borrado lógico

Las entidades de negocio deben utilizar borrado lógico por defecto.

El borrado físico queda reservado para datos temporales, descartables o casos explícitamente justificados.

Las consultas normales deben excluir registros con `deleted_at` informado, salvo casos de auditoría, recuperación o administración que requieran lo contrario.

`is_active` puede utilizarse adicionalmente cuando represente un estado funcional diferente al borrado lógico.

## Fechas y zona horaria

Todas las fechas técnicas deben almacenarse en UTC.

La API debe utilizar formatos ISO 8601 con información de zona horaria cuando corresponda.

La conversión a la zona horaria del usuario, sede o negocio debe realizarse en la capa de presentación o en el borde correspondiente del sistema.

## API

REST + OpenAPI es el estándar inicial. Los contratos deben ser consistentes, versionados y estables.

### Versionado

Toda API debe nacer versionada desde el inicio usando:

```text
/api/v1/...
```

Una nueva versión, por ejemplo `/api/v2`, solo debe introducirse cuando exista un cambio incompatible de contrato. Los cambios compatibles deben mantenerse en la versión vigente.

### Convenciones de rutas

Los recursos deben expresarse como sustantivos en plural, en minúscula y sin verbos.

Ejemplo:

```text
GET    /api/v1/customers
GET    /api/v1/customers/{id}
POST   /api/v1/customers
PATCH  /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
```

Cuando una ruta requiera más de una palabra, usar `kebab-case`.

### Actualizaciones

`PATCH` es el método estándar para actualizaciones parciales de recursos.

`PUT` debe reservarse para reemplazos completos de un recurso cuando ese comportamiento sea realmente necesario.

### Actualizaciones masivas por ID

Los módulos que necesiten modificar múltiples registros deben exponer una operación masiva explícita basada en IDs. No se deben encadenar llamadas individuales desde el frontend cuando una operación de negocio sea naturalmente masiva.

Convención recomendada:

```text
PATCH /api/v1/customers/bulk
```

Ejemplo de payload cuando todos los registros reciben los mismos cambios:

```json
{
  "ids": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ],
  "changes": {
    "is_active": false
  }
}
```

Cuando cada registro necesite cambios diferentes, se puede utilizar un contrato explícito por elemento:

```json
{
  "items": [
    {
      "id": "uuid-1",
      "changes": {
        "name": "Cliente A"
      }
    },
    {
      "id": "uuid-2",
      "changes": {
        "name": "Cliente B"
      }
    }
  ]
}
```

Reglas para operaciones masivas:

- cada registro debe identificarse mediante su `id` UUID;
- el service debe validar permisos y reglas de negocio para todos los registros afectados;
- la operación debe ejecutarse dentro de una transacción cuando el caso de uso requiera atomicidad;
- no debe permitirse una actualización masiva sin un conjunto explícito de IDs;
- deben definirse límites razonables de cantidad por request cuando el volumen pueda impactar rendimiento;
- la respuesta debe indicar de forma clara qué registros fueron modificados y, cuando aplique, cuáles fallaron;
- si la semántica exige que todos los registros se actualicen o ninguno, debe aplicarse rollback completo ante cualquier error.

### Paginación, filtros y ordenamiento

Las colecciones paginadas deben utilizar `page` y `page_size`.

Los filtros, búsqueda y ordenamiento se expresan mediante query params.

Ejemplo:

```text
GET /api/v1/customers?page=1&page_size=20&search=juan&sort_by=name&sort_order=asc
```

Respuesta paginada estándar:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 125,
  "pages": 7
}
```

## Seguridad

La arquitectura debe contemplar autenticación, autorización, manejo seguro de secretos, validación de entradas, control de errores y trazabilidad.

## Observabilidad

Definir logs estructurados, métricas y health checks según el nivel de madurez del proyecto.

## Decisiones arquitectónicas

Toda decisión material o difícil de revertir debe documentarse en `docs/architecture/decisions/`.

Consulta también `docs/architecture/stack-tecnologico.md` para el stack oficial por defecto.
