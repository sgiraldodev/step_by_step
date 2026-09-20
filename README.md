# Step by step · Pomodoro Santi

Aplicación de enfoque personal trasladada desde `Pomodoro_Santi` a la estructura y reglas de este repositorio. Conserva cuentas privadas, recuperación de acceso, tareas, rutinas diarias, etiquetas, estadísticas, temas y temporizador persistente con modo de enfoque.

## Inicio

Requisitos: Docker Desktop con contenedores Linux y Docker Compose.

1. Copiar `.env.example` a `.env` si no existe.
2. Configurar una contraseña PostgreSQL y un token de instalación aleatorios. No versionar `.env`.
3. Ejecutar `docker compose up --build -d --wait`.
4. Abrir http://localhost:3102. La API está en http://localhost:8102/docs y el catálogo visual en http://localhost:3102/design-system.

El servicio `migrations` ejecuta Alembic antes del backend. `/health` comprueba el proceso; `/ready` valida PostgreSQL. Los puertos y el volumen `step_by_step_postgres_data` son independientes de la instalación original. La cookie `step_by_step_session` evita interferir con sus sesiones.

## Estructura

```text
backend/app/core/               Configuración, sesiones, seguridad y errores
backend/app/modules/auth/      Identidad y recuperación de acceso
backend/app/modules/focus/     Tareas, rutinas, etiquetas y esfuerzo
backend/app/integrations/      Envío de correo
backend/migrations/            Historial Alembic original, revisiones 001–004, nombre personal 005 y color por usuario 006
frontend/src/app/              Rutas y estilos con tokens
frontend/src/modules/          Módulos auth y focus
frontend/src/components/ui/    Componentes compartidos
frontend/src/lib/http.ts       Cliente HTTP versionado
docs/                         Producto, arquitectura, diseño y operación
```

## Validaciones

Desde `backend`, instalar las versiones verificadas con `pip install -r requirements.lock`. Después ejecutar: `ruff check app tests`, `ruff format --check app tests` y `pytest`. Para las pruebas configurar `DATABASE_URL=sqlite:///test-isolated.db`; cada caso crea una base temporal distinta y nunca vacía una base existente. Las pruebas de API y permisos utilizan AsyncSession, con SQLite únicamente como motor aislado de pruebas.

Desde `frontend`: `npm ci`, `npm run lint`, `npm run format:check`, `npm run check`, `npm test`, `npm run test:legacy` y `npm run build`. `npm run test:e2e` valida el flujo real sobre la aplicación local en Docker.

Consultar [manual de usuario](docs/product/manual-usuario.md), [arquitectura](docs/architecture/architecture.md), [decisión de migración](docs/architecture/decisions/ADR-001-migracion-pomodoro.md) y [registro de validación](docs/development/migracion-pomodoro.md).

## Datos y operación

La instalación empieza con una base nueva y vacía, según la decisión del usuario. No se copian cuentas ni historial anteriores. El repositorio original y su volumen permanecen intactos. Las migraciones conservan IDs, hashes de contraseña, propietarios e historial. No ejecutar pruebas, semillas ni restauraciones contra la base original. Cualquier reemplazo, eliminación o restauración sobre datos existentes requiere autorización específica según `AGENTS.md`.

El registro requiere validar el correo. Configura `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` y `EMAIL_FROM` en `.env`. La recuperación también ofrece códigos por correo de cuatro dígitos válidos durante tres minutos. La integración independiente permite cambiar de proveedor; SMTP permanece como alternativa. Véase [ADR-003](docs/architecture/decisions/ADR-003-verificacion-correo-resend.md). Una publicación externa requiere HTTPS, `COOKIE_SECURE=true`, orígenes explícitos y la política de respaldos definida en `docs/operations/`.

El registro pide nombre y correo; se inicia sesión y recupera acceso únicamente con correo electrónico. El nombre se usa en el saludo, admite espacios y no es único. Véase [ADR-002](docs/architecture/decisions/ADR-002-correo-y-nombre-personal.md).

## Contexto bajo demanda

`PROJECT_CONTEXT.md` funciona como índice del repositorio. Los agentes leen primero ese mapa y después cargan solo las reglas de producto, arquitectura, diseño, desarrollo u operación que correspondan a la tarea. Esto reduce consumo de contexto y evita decisiones influenciadas por documentación no relacionada.
