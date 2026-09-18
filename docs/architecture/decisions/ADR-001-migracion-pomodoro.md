# ADR-001 — Migración compatible de Pomodoro Santi

## Estado

Aceptado.

## Contexto

Pomodoro Santi ya contiene reglas, datos y contratos probados. El destino es un starter documental sin aplicación ejecutable. Adoptar su estructura debe conservar el comportamiento y evitar una sustitución destructiva del esquema o de las cuentas existentes.

## Decisión

Usar FastAPI, SQLAlchemy 2.x AsyncSession, PostgreSQL y Alembic en un monolito modular. `auth` administra identidad, sesiones, límites de intentos y recuperación. `focus` es una frontera cohesionada que administra tareas, rutinas, etiquetas y recibos; sus servicios se separan por responsabilidad bajo `services/` por crecimiento real. Sus consultas y relaciones no constituyen accesos entre dominios independientes.

Los routers invocan servicios públicos, los repositories encapsulan SQL y los servicios controlan commit/rollback. La identidad autenticada establece owner_id en la sesión de request. El frontend usa `src/app`, `src/modules`, `src/components/ui` y un cliente HTTP común. Las rutas canónicas están versionadas; PATCH es la edición estándar. Se conservan las rutas anteriores y PUT como alias fuera de OpenAPI para compatibilidad.

Se mantienen las cookies con token opaco aleatorio, hash persistido, vencimiento y revocación existentes. No se añade JWT/refresh ni RBAC porque solo hay cuentas propietarias, sin roles ni colaboración; añadirlos cambiaría el producto sin necesidad funcional. La autorización por propietario sigue siendo obligatoria en el servidor. Las contraseñas nuevas y los restablecimientos usan Argon2id. Se conserva la verificación de hashes scrypt históricos, sin forzar cambios de contraseña ni reescribir hashes existentes.

Se conservan los IDs enteros de tareas/rutinas, los UUID existentes de usuarios/etiquetas y las revisiones 001–004. El producto no expone eliminación de entidades: desactivar rutinas y restaurar tareas conserva su historial; no se añaden deleted_at ni nuevas operaciones de borrado ficticias. Tailwind 4 y los tokens existentes se mantienen como implementación del Design System. No se agregan gestores de formularios, tablas ni estado remoto si la funcionalidad actual no los necesita.

Las herramientas de CI, lint, formato y pruebas se añaden conforme al starter. SQLite solo se usa en pruebas aisladas y preview; el entorno operativo usa PostgreSQL. Los tests síncronos de inspección de datos están aislados en `tests/database.py`; la aplicación utiliza AsyncSession nativa.

## Alternativas consideradas

- Copiar el monolito sin reorganizar: incumple los límites y la mantenibilidad del destino.
- Reescribir contratos, autenticación y claves: aumenta riesgo de pérdida de compatibilidad sin aportar una funcionalidad solicitada.
- Separar cada entidad en dominios: crea dependencias artificiales entre rutinas, tareas y recibos que forman un mismo flujo de enfoque.

## Consecuencias

### Positivas

Se preservan comportamiento, contratos e historial de migraciones; los límites quedan explícitos y la operación es reproducible.

### Negativas o costos

La autenticación, claves heredadas y alias difieren de los valores genéricos del starter. El reloj continúa siendo local al navegador; la API no certifica el tiempo transcurrido.

## Impacto

Backend, frontend, configuración, pruebas, documentación y Docker. SMTP continúa siendo opcional. No se despliega a producción ni se modifica el volumen original.

## Estrategia de reversión o migración

Conservar íntegros el repositorio y volumen originales. La nueva instalación tiene puertos, cookie y volumen propios. Por instrucción explícita del usuario, la nueva base comienza desde cero. Se aplica Alembic sin copiar cuentas ni historial. No se ejecutan downgrades ni reemplazos de datos.

## Actualización posterior

[ADR-002](ADR-002-correo-y-nombre-personal.md) sustituye la identificación por nombre de usuario por correo electrónico y añade el nombre personal para el saludo. Los demás límites y decisiones de esta migración se conservan.
