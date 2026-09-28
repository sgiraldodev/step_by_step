# MEMORY.md

## Propósito

Este archivo conserva la memoria operativa, funcional y técnica acumulada de Step by Step para que agentes y asistentes puedan retomar trabajo sin solicitar nuevamente contexto ya establecido.

Debe leerse después de `AGENTS.md` y `PROJECT_CONTEXT.md`.

`MEMORY.md` no reemplaza las fuentes de verdad. El código vigente, la documentación del producto, arquitectura, ADR y demás documentos enlazados por `PROJECT_CONTEXT.md` tienen prioridad.

## Qué debe registrarse

Registra conocimiento durable y útil para tareas futuras:

- decisiones ya tomadas;
- convenciones específicas del proyecto;
- aprendizajes derivados de problemas resueltos;
- restricciones importantes;
- estado relevante de módulos;
- deuda técnica o pendientes con impacto futuro;
- contexto funcional que el usuario haya explicado y deba reutilizarse.

## Qué no debe registrarse

No guardes secretos, credenciales, logs extensos, debugging temporal, cada tarea ejecutada, duplicados completos de otros documentos ni hipótesis no verificadas.

## Reglas de mantenimiento

1. Al finalizar una tarea, evalúa si produjo conocimiento durable que evitaría pedir contexto otra vez.
2. Si existe, actualiza este archivo dentro del mismo cambio lógico.
3. Reemplaza conocimiento obsoleto en lugar de acumular versiones contradictorias.
4. Usa fecha `YYYY-MM-DD` para decisiones significativas cuando aporte trazabilidad.
5. Resume y enlaza las fuentes de verdad; no las copies completas.
6. Si una entrada crece demasiado, promuévela a documentación formal o ADR.
7. Mantén la memoria compacta para preservar la carga selectiva de contexto.
8. Ante conflicto, prevalecen el código vigente y las fuentes formales; corrige `MEMORY.md`.

## Memoria inicial verificada

### Flujo de contexto

- Step by Step usa el flujo `AGENTS.md` → `PROJECT_CONTEXT.md` → `MEMORY.md` → fuentes específicas requeridas.
- La carga de contexto se clasifica como `LIGHT`, `STANDARD` o `FULL`.
- No deben cargarse directorios completos, todos los ADR, prompts o Skills por defecto.

Fuente: `AGENTS.md`, `PROJECT_CONTEXT.md`.

### Contexto funcional y técnico específico

- El comportamiento visible al usuario tiene como referencia `docs/product/manual-usuario.md`.
- La migración del Pomodoro se documenta en `docs/architecture/decisions/ADR-001-migracion-pomodoro.md` y `docs/development/migracion-pomodoro.md`.
- La decisión sobre correo y nombre personal se documenta en `docs/architecture/decisions/ADR-002-correo-y-nombre-personal.md`.
- Estas rutas deben cargarse únicamente cuando la tarea afecte esos temas.

Fuente: `PROJECT_CONTEXT.md`.

### Seguridad de datos

- Las operaciones destructivas requieren autorización explícita del usuario.
- Nunca eliminar, resetear, vaciar, recrear destructivamente ni reemplazar una base de datos sin autorización explícita.

Fuente: `AGENTS.md`.

### Versionado

- La fuente única de versión es `VERSION`.
- Cambios exclusivamente documentales pueden no incrementar la versión.
- Los TAG productivos se derivan de la versión vigente y no se crean por cada commit.

Fuente: `docs/development/git-strategy.md`.

### Acceso local

- La aplicación local se sirve desde el frontend compilado de Docker; editar
  archivos no actualiza la pantalla. Para aplicar cambios visuales locales,
  reconstruir y actualizar solo `frontend` con
  `docker compose up -d --build --no-deps frontend`, y verificar el servicio.
- El acceso local por Docker admite `localhost` y `127.0.0.1` en el puerto de
  `FRONTEND_PORT`. La protección de escritura comprueba los orígenes explícitos
  de `APP_ORIGIN` y `CORS_ORIGINS`; ver `docs/operations/environments.md`.

### Finalización manual de tareas

- La lista tiene prioridad visual: el alta se abre con **Nueva tarea** en un modal,
  y los filtros de estado usan iconos, contadores y selección destacada. Empieza
  en **Pendientes** y deja **Todas** al final. Las acciones de fila usan iconos
  compactos; el espacio autenticado admite hasta 1440 px de ancho. Ver
  `docs/design/design-system.md` y `docs/product/manual-usuario.md`.

- Las tareas puntuales pueden completarse sin registrar tiempo mediante `complete`.
  Conserva ciclos y esfuerzo, admite reintentos y se revierte con `restore`.
  La interfaz bloquea la acción para la tarea con reloj abierto; las rutinas
  conservan `check`. Ver `docs/product/manual-usuario.md`.

- Las casillas del listado seleccionan tareas para operaciones múltiples mediante
  los endpoints individuales existentes. La selección se limita al filtro visible;
  los fallos conservan su selección y los éxitos no se revierten. El borrado mantiene
  la restricción de tareas pendientes/en progreso y exige confirmación en pantalla.

## Pendientes de memoria

- Sin pendientes iniciales.
