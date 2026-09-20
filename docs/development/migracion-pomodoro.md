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

## Ajustes de cierre y creación de tareas

Al finalizar enfoque o descanso suena un arpegio breve tipo arpa, generado localmente por el navegador. El sonido se habilita con la primera interacción; depende del permiso de reproducción del navegador y del volumen del dispositivo. Al terminar el enfoque se puede continuar la misma tarea (registra un ciclo y comienza el descanso antes del siguiente bloque), terminarla o cambiar de tarea. Cambiar registra el ciclo completado, conserva la tarea en progreso y permite seleccionar otra. Los reintentos reutilizan el identificador del bloque para evitar duplicados.

En Mis tareas, el título tiene fondo y borde visibles; Agregar aparece después del selector de etiquetas. La lista de etiquetas conserva selección múltiple y se cierra al pulsar fuera, salir con el teclado o presionar Escape.

## Operación

El diálogo de fin de enfoque incluye siempre un segmento con un GIF elegido aleatoriamente entre quince escenas de The Office al abrirse. La selección permanece estable durante la decisión y los reintentos de guardado. Los quince GIF y sus imágenes estáticas se sirven desde `frontend/public/gifs/the-office`, sin API externa ni claves. Se puede pausar y reproducir la animación; con movimiento reducido comienza como imagen estática. El diálogo admite desplazamiento vertical en pantallas pequeñas.

La colección incluye doce escenas adicionales del [catálogo público de The Office](https://giphy.com/theoffice). Los archivos nuevos usan la versión GIF de ancho 200 px para reducir su peso. Sus fuentes se detallan en [el catálogo de GIF](../design/gifs-the-office.md).

Fuentes: [Jim y Dwight](https://giphy.com/gifs/theoffice-nbc-the-office-tv-6FrujVG4mafRETQTal), [celebración de Dwight](https://giphy.com/gifs/theoffice-pWO49XP9L7TxbgQVib/) y [cumpleaños](https://giphy.com/gifs/nbc-tv-the-office-sitcom-RfSQID4Y1lMOnJlO0a), publicados por The Office y NBC en GIPHY.

Consultar [README](../../README.md) para inicio y configuración. La vista de pruebas opcional se inicia con `docker compose -f compose.preview.yaml up -d --wait`; no utiliza PostgreSQL ni datos personales.

Las dependencias frontend tienen lockfile; `backend/requirements.lock` conserva las versiones exactas verificadas. Para pruebas de Vitest se recomienda Node.js 22 actualizado; alternativamente, construir el target `checks` del Dockerfile y ejecutar `npm test` en ese contenedor. El navegador para Playwright puede seleccionarse con `PLAYWRIGHT_CHANNEL=msedge`.

## Personalización de color

Configuración incorpora «Color de la aplicación» con diez colores, incluidos rosado y lila. La selección aplica inmediatamente el color a los botones, resaltados y fondo, y se conserva en este navegador para próximas visitas. Funciona en modo claro y oscuro. La preferencia visual es independiente de los tiempos y no modifica tareas ni datos de la cuenta.

Validación: 27 pruebas frontend aprobadas, ESLint, Prettier y compilación con TypeScript; flujo Playwright con datos interceptados aprobado para selección de las diez opciones, recarga, modo oscuro, teclado y móvil de 390 px. Contraste de texto blanco sobre las diez muestras de acento superior a 4,5:1.

## Ajuste posterior: identificación por correo

El registro usa nombre personal y correo. Se eliminó el nombre de usuario del flujo público; acceso y recuperación usan exclusivamente correo. La migración aditiva `005` conserva información anterior. Consultar [ADR-002](../architecture/decisions/ADR-002-correo-y-nombre-personal.md).

Validación del ajuste: 24 pruebas backend, 20 frontend y 2 flujos Playwright aprobados; `alembic check` sin diferencias después de aplicar `005`.
