---
name: project-bootstrap
description: Preparar o revisar el bootstrap técnico de un proyecto basado en el starter. Usar para crear o completar la base ejecutable con FastAPI, Next.js, PostgreSQL, Alembic, Docker, configuración, testing, observabilidad y CI/CD antes de construir funcionalidades de negocio.
---

# Project Bootstrap

## Propósito

Convertir la definición documental del proyecto en una base técnica ejecutable y reproducible, sin inventar funcionalidades de negocio.

## Antes de actuar

Lee:

- `AGENTS.md`;
- `docs/prompts/_reglas-globales.md`;
- `docs/development/checklist-inicio-proyecto.md`;
- `docs/architecture/`;
- `docs/design/`;
- `docs/development/testing-strategy.md`;
- `docs/development/definition-of-done.md`;
- `docs/operations/environments.md`;
- `docs/operations/deployment.md`.

Si existe `docs/prompts/17-bootstrap-tecnico-proyecto.md`, úsalo como contrato de alcance de la tarea.

## Condiciones previas

Confirma que estén razonablemente definidos:

- Product Brief;
- alcance del MVP;
- módulos iniciales;
- decisiones arquitectónicas principales;
- estrategia multi-tenant si aplica;
- Design System o estrategia visual base.

No bloquees por decisiones de negocio que no sean necesarias para crear la infraestructura técnica.

## Método

1. Inspecciona qué parte del bootstrap ya existe.
2. Reutiliza primero, extiende después y crea solo lo faltante.
3. Evita instalar herramientas o dependencias fuera del entorno soportado si Docker puede resolverlo.
4. Crea una base mínima pero completa y operativa.
5. Verifica cada capa antes de continuar.
6. No construyas módulos de negocio ficticios para llenar estructura.

## Backend

Prepara cuando falte:

```text
backend/
└── app/
    ├── core/
    ├── integrations/
    ├── modules/
    └── main.py
```

Configura según la arquitectura vigente:

- FastAPI;
- configuración central tipada;
- PostgreSQL;
- SQLAlchemy 2.x async;
- `AsyncSession` por request;
- Alembic;
- excepciones globales;
- seguridad transversal base;
- `/health` y `/ready`;
- request/correlation ID;
- logs estructurados.

## Frontend

Prepara cuando falte:

```text
frontend/
└── src/
    ├── app/
    ├── modules/
    ├── components/
    │   └── ui/
    ├── lib/
    └── types/
```

Configura únicamente las dependencias previstas por el stack vigente y necesarias para el bootstrap.

Materializa el Design System existente mediante tokens, componentes base y catálogo cuando el alcance aprobado lo contemple. No inventes una segunda fuente visual.

## Docker

El entorno de desarrollo debe poder levantarse de forma reproducible mediante Docker Compose cuando así lo define el proyecto.

Valida como mínimo:

- backend;
- frontend;
- PostgreSQL;
- redes y volúmenes;
- variables de entorno;
- health checks aplicables;
- nomenclatura clara de servicios, contenedores e imágenes.

Convención base:

```text
<proyecto>_<servicio>
```

Ejemplos:

```text
trazenda_frontend
trazenda_backend
trazenda_postgres
```

La versión debe expresarse mediante TAG y/o SHA, por ejemplo:

```text
trazenda_frontend:v0.1.0
trazenda_backend:v0.1.0
```

No utilices números aislados, hashes, nombres automáticos o nombres genéricos como identificador principal cuando el proyecto y servicio puedan identificarse claramente.

Las imágenes oficiales de terceros pueden conservar su nombre del proveedor, pero el servicio o contenedor dentro del proyecto debe seguir siendo reconocible, por ejemplo `trazenda_postgres`.

No uses comandos destructivos contra volúmenes o bases de datos sin autorización explícita.

## Testing y calidad

Configura la infraestructura definida por el proyecto, normalmente:

- pytest;
- Vitest + Testing Library;
- Playwright cuando aplique;
- cobertura;
- Ruff;
- ESLint;
- Prettier.

No crees pruebas sin valor únicamente para aumentar cobertura.

## CI/CD

Prepara el pipeline base conforme a la documentación vigente. No despliegues a producción ni crees releases productivos salvo solicitud explícita.

## Validación de salida

Antes de considerar completado el bootstrap, comprueba cuando aplique:

- backend inicia;
- frontend inicia;
- backend conecta con PostgreSQL;
- Alembic funciona;
- `/health` responde;
- `/ready` valida dependencias;
- lint y tests se ejecutan;
- Docker Compose levanta la solución;
- nombres Docker identifican claramente proyecto y servicio;
- no hay secretos versionados;
- no se introdujo lógica de negocio fuera de alcance.

## Resultado esperado

Dejar el repositorio preparado para implementar la primera funcionalidad real mediante la Skill `vertical-slice` o `docs/prompts/16-crear-vertical-slice.md`.
