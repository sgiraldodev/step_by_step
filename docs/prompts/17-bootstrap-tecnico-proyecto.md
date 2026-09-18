# Bootstrap técnico de proyecto

## Objetivo

Preparar la base técnica ejecutable de un proyecto nuevo una vez que el Product Brief, alcance del MVP, requisitos principales, módulos de negocio y decisiones arquitectónicas relevantes estén suficientemente definidos.

Este prompt no debe usarse para descubrir el producto ni para construir funcionalidades de negocio completas. Su responsabilidad es dejar lista una base técnica coherente, reproducible y preparada para implementar la primera vertical slice.

## Reglas heredadas

Este prompt hereda obligatoriamente:

- `AGENTS.md`;
- `docs/prompts/_reglas-globales.md`;
- `docs/development/checklist-inicio-proyecto.md`;
- arquitectura y stack tecnológico vigentes;
- estrategia de testing;
- Definition of Done;
- reglas de seguridad, autenticación, autorización y multi-tenant;
- reglas de Design System.

## Condiciones previas

Antes de proponer cambios, verifica que estén razonablemente definidos:

- Product Brief;
- alcance del MVP;
- requisitos funcionales y no funcionales principales;
- módulos iniciales;
- integraciones conocidas;
- si el proyecto usa multi-tenant;
- Design System base o estrategia visual definida.

Si falta una decisión menor, aplica las reglas globales de ambigüedad. Si falta una decisión material que cambie arquitectura, seguridad, datos o alcance, solicítala antes de ejecutar.

## Propuesta previa

Antes de modificar código, presenta la propuesta breve y ejecutiva definida en `_reglas-globales.md`.

La propuesta debe indicar además qué partes del bootstrap ya existen y serán reutilizadas, cuáles deben completarse y si existe alguna desviación respecto del starter.

Espera una única aprobación antes de ejecutar.

## Alcance mínimo del bootstrap

Después de la aprobación, inspecciona el repositorio y crea únicamente lo que falte.

### 1. Backend FastAPI

Preparar una estructura base coherente con la arquitectura oficial, incluyendo cuando aplique:

```text
backend/
└── app/
    ├── core/
    │   ├── config.py
    │   ├── database.py
    │   ├── dependencies.py
    │   ├── security.py
    │   └── exceptions.py
    ├── integrations/
    ├── modules/
    └── main.py
```

Debe quedar preparado para módulos con el patrón:

```text
router → service → repository → model/schema
```

No crear módulos de negocio ficticios únicamente para llenar la estructura.

### 2. Configuración

Configurar `pydantic-settings` como punto central de configuración.

Crear o actualizar `.env.example` sin secretos reales.

No hardcodear credenciales, URLs sensibles ni secretos.

### 3. PostgreSQL y SQLAlchemy

Configurar:

- PostgreSQL;
- SQLAlchemy 2.x async;
- `AsyncSession` por request;
- conexión y lifecycle de base de datos;
- convenciones de nombres definidas por el proyecto.

No crear, eliminar, resetear, vaciar ni recrear destructivamente ninguna base de datos sin autorización explícita del usuario.

### 4. Alembic

Configurar Alembic y dejar lista la infraestructura de migraciones.

No crear migraciones de negocio ficticias si todavía no existen entidades reales que las requieran.

Toda futura modificación de esquema debe pasar por Alembic.

### 5. Autenticación y autorización base

Preparar la infraestructura necesaria para:

- access token JWT de corta duración;
- refresh token rotativo y revocable;
- cookie segura para refresh token;
- hashing Argon2id;
- RBAC granular;
- permisos efectivos;
- contexto de tenant cuando el proyecto sea multi-tenant;
- rate limiting en endpoints sensibles.

Si implementar completamente autenticación en esta fase implica inventar entidades o reglas funcionales aún no definidas, dejar la infraestructura preparada y completar la funcionalidad mediante una vertical slice posterior.

### 6. Observabilidad base

Configurar cuando aplique:

- logs estructurados;
- `request_id` o `correlation_id`;
- endpoint `/health`;
- endpoint `/ready`;
- base para métricas y monitoreo.

### 7. Frontend Next.js

Preparar una estructura base orientada por feature:

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

Configurar según corresponda:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- tokens del Design System existente;
- Lucide React;
- TanStack Query;
- React Hook Form;
- Zod;
- TanStack Table;
- `date-fns`;
- cliente HTTP centralizado;
- manejo centralizado de errores;
- sistema global de toast;
- Route Groups y layouts base cuando la estructura del producto ya esté definida.

No reconstruir el Design System si ya existe. Reutilizarlo y verificar que sus componentes tengan documentación y ejemplos de uso según el estándar vigente.

### 8. Testing

Configurar la infraestructura base de pruebas:

- `pytest` para backend;
- Vitest + Testing Library para frontend;
- Playwright cuando aplique;
- medición de cobertura;
- umbral global mínimo del 80%;
- estructura para fixtures y datos de prueba.

No crear tests artificiales únicamente para alcanzar cobertura si todavía no existe comportamiento real que probar.

### 9. Calidad de código

Configurar cuando aplique:

- Ruff para Python;
- ESLint;
- Prettier;
- comandos reproducibles de lint, format y test.

### 10. Docker

Crear o validar:

- Dockerfile de backend;
- Dockerfile de frontend;
- `docker-compose.yml` para desarrollo;
- PostgreSQL como servicio local;
- redes y volúmenes necesarios;
- health checks cuando correspondan;
- nombres claros y consistentes para servicios, contenedores e imágenes.

La convención base para nombres Docker es:

```text
<proyecto>_<servicio>
```

Ejemplos:

```text
trazenda_frontend
trazenda_backend
trazenda_postgres
```

La versión debe expresarse en el TAG o SHA, por ejemplo:

```text
trazenda_frontend:v0.1.0
trazenda_backend:v0.1.0
```

No utilizar números aislados, hashes o nombres genéricos como identificador principal de la imagen cuando el proyecto y el servicio pueden nombrarse de forma explícita.

Para imágenes oficiales de terceros puede conservarse la imagen del proveedor, pero el servicio o contenedor del proyecto debe seguir una nomenclatura identificable, por ejemplo `trazenda_postgres`.

El objetivo es que el proyecto pueda levantarse de forma reproducible con Docker Compose sin depender de instalaciones locales innecesarias.

### 11. Ambientes

Dejar preparada la separación entre:

```text
development
staging
production
```

No incluir secretos reales en el repositorio.

### 12. GitHub Actions

Preparar el pipeline base cuando corresponda al alcance aprobado:

```text
lint
→ tests
→ cobertura
→ build
→ imagen Docker
→ staging
→ aprobación manual
→ producción
```

Las migraciones Alembic deben ejecutarse como un paso explícito y controlado del despliegue cuando existan migraciones reales.

Los secretos deben consumirse mediante GitHub Secrets/Environments u otro gestor autorizado.

### 13. Versionado y release

Respetar la estrategia del proyecto:

- rama estable `release`;
- sin push directo cuando la protección esté disponible;
- ramas `feature/*`, `fix/*` y `hotfix/*`;
- Semantic Versioning;
- TAG para cada despliegue productivo;
- imágenes Docker identificables por nombre descriptivo y versionadas por TAG y/o SHA;
- `latest` no debe ser la única referencia productiva.

No crear releases o TAGs productivos durante el bootstrap salvo solicitud explícita.

### 14. Documentación operativa

Actualizar o completar según aplique:

- `README.md` operativo;
- onboarding técnico;
- comandos de arranque;
- variables de entorno;
- migraciones;
- testing;
- Docker;
- troubleshooting inicial;
- cualquier desviación del starter.

## Verificación final del bootstrap

Antes de considerar esta fase terminada, verificar como mínimo:

- backend inicia correctamente;
- frontend inicia correctamente;
- PostgreSQL es accesible desde backend;
- `/health` responde;
- `/ready` valida dependencias configuradas;
- Alembic está operativo;
- lint funciona;
- infraestructura de tests funciona;
- Docker Compose levanta los servicios definidos;
- nombres Docker permiten identificar claramente proyecto y servicio;
- no existen secretos versionados;
- no se introdujeron funcionalidades de negocio fuera de alcance;
- la documentación necesaria está actualizada.

## Resultado esperado

El repositorio debe quedar técnicamente preparado para ejecutar a continuación:

`docs/prompts/16-crear-vertical-slice.md`

sobre la primera funcionalidad real del producto.
