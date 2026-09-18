# Migración de Pomodoro Santi

## Alcance

Se trasladó la aplicación completa a Step_by_Step: cuentas privadas y recuperación por código/correo, tareas y prioridades, temporizador configurable con pausa y persistencia, cierre anticipado e interrupción, rutinas diarias con historial, etiquetas, estadísticas y temas claro/oscuro.

Por decisión explícita del usuario, la instalación nueva comienza sin copiar cuentas ni historial de la base anterior. El repositorio y el volumen originales permanecen intactos.

## Adaptación al starter

- Backend modular: `auth` y `focus`, routers → servicios → repositories, configuración tipada y AsyncSession por petición.
- Frontend bajo `src/app`, `src/modules` y `src/components/ui`; cliente HTTP central, API `/api/v1`, catálogo `/design-system`.
- Repositories encapsulan consultas; los servicios controlan transacciones. Tareas, rutinas, etiquetas y esfuerzo permanecen en un dominio cohesionado.
- `TaskList` y `TimerPanel` componen la pantalla; `useFocusData` administra datos remotos y `useTimerSession` administra reloj y almacenamiento del navegador.
- Contraseñas nuevas con Argon2id; verificación de scrypt histórico compatible. Cookie HttpOnly y validación de origen, sin introducir roles inexistentes en el producto.
- Se conservan las cuatro migraciones Alembic originales y los contratos anteriores mediante aliases ocultos del OpenAPI.
- Docker Compose independiente, `/health`, `/ready`, logs JSON, request IDs, CI y cobertura mínima global del 80 %.

Las excepciones deliberadas respecto a los valores por defecto del starter están documentadas en [ADR-001](../architecture/decisions/ADR-001-migracion-pomodoro.md).

## Verificación

- Backend: 24 pruebas aprobadas; cobertura global con ramas 94,56 %.
- Frontend: 20 pruebas aprobadas; cobertura 82,95 % de instrucciones y 83,98 % de líneas. El layout de servidor se verifica mediante compilación de Next.js.
- Ruff, TypeScript, ESLint, Prettier y pruebas originales del temporizador.
- Playwright: flujo completo de registro, tarea, pausa/recarga/reanudación, cierre, rutina y estadísticas aprobado. Captura móvil de 390 px revisada sin desbordamiento horizontal.
- Compilación de las imágenes de backend y frontend completada.
- PostgreSQL: prueba HTTP de reintentos concurrentes, registro único de bloques y generación diaria de rutinas aprobada en la base independiente `step_migration_check`, con cuentas ficticias.
- PostgreSQL: revisiones 001–004 aplicadas en una base de validación independiente; `alembic check` sin diferencias.
- Instalación definitiva iniciada en http://localhost:3102 sobre una base nueva, con servicios saludables.

La validación en navegador usa una cuenta ficticia exclusivamente en la vista aislada http://localhost:3103. No ejecutar pruebas ni semillas contra la base original ni contra cuentas reales.

## Operación

Consultar [README](../../README.md) para inicio y configuración. La vista de pruebas opcional se inicia con `docker compose -f compose.preview.yaml up -d --wait`; no utiliza PostgreSQL ni datos personales.

Las dependencias frontend tienen lockfile; `backend/requirements.lock` conserva las versiones exactas verificadas. Para pruebas de Vitest se recomienda Node.js 22 actualizado; alternativamente, construir el target `checks` del Dockerfile y ejecutar `npm test` en ese contenedor. El navegador para Playwright puede seleccionarse con `PLAYWRIGHT_CHANNEL=msedge`.

## Ajuste posterior: identificación por correo

El registro usa nombre personal y correo. Se eliminó el nombre de usuario del flujo público; acceso y recuperación usan exclusivamente correo. La migración aditiva `005` conserva información anterior. Consultar [ADR-002](../architecture/decisions/ADR-002-correo-y-nombre-personal.md).

Validación del ajuste: 24 pruebas backend, 20 frontend y 2 flujos Playwright aprobados; `alembic check` sin diferencias después de aplicar `005`.
