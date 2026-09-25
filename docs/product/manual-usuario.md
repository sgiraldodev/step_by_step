# Step by step

Gestor de tareas en español con Next.js, React, TypeScript y Tailwind CSS; API FastAPI, SQLAlchemy y PostgreSQL. Los tres servicios se ejecutan en Docker Compose.

## Cuentas y espacios privados

Sin una sesión abierta, el inicio presenta una escena tranquila de café y la sección **Qué es Step by Step**, que explica cómo la herramienta combina una lista de tareas (ToDo) con Pomodoro para organizar nuestras tareas diarias, trabajar con pausas y seguir el tiempo dedicado a cada tarea. **Descubre cómo** lleva a esta sección. También presenta los beneficios de organizar el trabajo en bloques y una guía de 25 minutos de enfoque y 5 de pausa. Los tiempos son un punto de partida y pueden ajustarse en Configuración. Las tarjetas Música, Guitarra y Lectura permiten elegir una actividad y muestran un mensaje sobre reservar tiempo para disfrutarla; son contenido visual, sin reproducción de audio.

**Encuentra tu ritmo** y **Crear mi espacio** abren el registro en `/acceso#registro`. **Entrar** abre el inicio de sesión en `/acceso`. Los formularios están en una página independiente y no aparecen al final de la portada. Una sesión activa entra directamente al espacio personal; los enlaces de recuperación y activación mantienen su flujo específico.

La pantalla de acceso ofrece registro, acceso con correo electrónico y contraseña y recuperación de contraseña. Cada cuenta tiene sus propias tareas, rutinas, etiquetas, estadísticas, configuración y temporizador. Las consultas y modificaciones se validan en el servidor, incluyendo los IDs de etiquetas y el historial de rutinas. Las contraseñas nuevas se almacenan con Argon2id; se mantiene la verificación de hashes scrypt heredados; las sesiones usan cookies HttpOnly, tokens aleatorios almacenados como hash, vencimiento de 7 días y revocación al cerrar sesión o cambiar la contraseña. Las operaciones del navegador validan origen y cabecera propia; se limitan intentos de autenticación y recuperación.

El registro muestra una sola vez un **código personal de recuperación**, con descarga opcional. **Olvidé mi contraseña** permite usarlo para elegir una nueva contraseña. Cada restablecimiento invalida todas las sesiones y sustituye el código anterior por uno nuevo. Guarda el código fuera de la aplicación. **Otro método · Enviar código al correo** permite ingresar un correo registrado, recibir un código de 4 dígitos y validarlo en la aplicación. Vence en 3 minutos; la pantalla muestra el tiempo restante y permite reenviar o cambiar el correo. Cada reenvío invalida el anterior. Tras validarlo tienes 10 minutos para elegir la nueva contraseña. El registro también exige validar el correo antes de completar nombre y contraseña, y no crea una cuenta si omites esta validación. Se limitan envíos e intentos de validación. Configura `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` y `EMAIL_FROM` en `.env`; para otros usuarios utiliza un remitente de un dominio verificado. El código personal sigue disponible. El API histórico de enlaces se conserva. `COOKIE_SECURE=true` requiere HTTPS; en esta instalación local HTTP se usa `false`. `APP_ORIGIN` en Compose define el origen permitido y el destino de los enlaces de correo.

La migración 004 conserva los datos originales en un usuario reservado que no puede iniciar sesión hasta activarse. Las cuentas nuevas empiezan vacías. Para activar el propietario original, abre la aplicación con `/#setup=<INITIAL_SETUP_TOKEN>` usando el valor privado de `.env`, registra tu nombre, correo y contraseña, y guarda el código personal de recuperación. El enlace contiene el token privado de instalación y solo se acepta una vez. No compartas ni versiones esos archivos. En una instalación nueva sin datos previos basta el registro normal.

**Cambiar de tarea**, disponible en enfoque y en el temporizador normal, guarda el tiempo efectivo del bloque, vuelve a pendiente y libera el reloj. No marca la tarea terminada ni suma un ciclo completo por un bloque interrumpido. En descanso no añade más tiempo. El icono **Restaurar tarea** permite reabrir una tarea terminada sin borrar sus ciclos ni su esfuerzo histórico.

El icono **Eliminar tarea** está disponible para tareas puntuales pendientes o en progreso. Pide confirmación y elimina definitivamente la tarea y su tiempo registrado, que deja de contar en las estadísticas. Si la tarea tenía un temporizador activo, este se cierra después del borrado. Las tareas terminadas no muestran esta acción.

## Inicio y operación

Consultar el README del repositorio para arranque, configuración, pruebas y puertos.

## Parte 1: interfaz Next.js

La cabecera incluye un botón para alternar entre **Modo oscuro** y **Modo claro**. Recuerda la elección en este navegador; en la primera visita usa la preferencia del sistema. La identidad visual usa azul profundo y las pestañas **Tareas** y **Rutinas diarias** tienen iconos y un fondo azul sólido para identificar la seleccionada.

### Etiquetas y estadísticas

Cada tarea o rutina admite hasta 10 etiquetas reutilizables. El selector permite buscar, seleccionar varias al pulsar cualquier parte de la fila o su casilla, quitar chips y crear una etiqueta con nombre y color (botón o Enter). Los nombres se deduplican sin distinguir mayúsculas ni espacios repetidos. **Etiquetas/Editar** permite clasificar actividades existentes. El filtro de etiqueta afecta la lista y sus métricas.

La tercera pestaña **Estadísticas** muestra tiempo de enfoque, bloques y tareas trabajadas, un gráfico de torta por etiquetas y barras diarias. Permite elegir fechas desde/hasta inclusivas (máximo 367 días) y una etiqueta. Filtrar una etiqueta selecciona los bloques que la contienen; el gráfico conserva el reparto entre todas las etiquetas de esos bloques.

Cada resolución guarda segundos de trabajo efectivos, excluyendo pausas y descansos. Terminar antes registra solo el tiempo consumido; la cuenta de ciclos conserva su regla de sumar uno. El registro usa la fecha de cierre en Colombia y conserva una copia de las etiquetas del bloque. Cambiar etiquetas después no reclasifica el historial. Los bloques con varias etiquetas reparten el tiempo por igual, evitando duplicación; los que no tienen etiquetas aparecen como **Sin etiqueta**. Los ciclos antiguos sin duración permanecen en las tareas y se excluyen de los gráficos, con una explicación visible.

`backend/migrations/versions/003_tags_effort.py` añade etiquetas, relaciones de tareas/rutinas y los campos de esfuerzo en los recibos existentes. `GET/POST /api/v1/tags` gestiona el catálogo, `tag_ids` en las operaciones de tareas/rutinas asigna etiquetas y `GET /api/v1/statistics?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&tag_id=UUID` consulta el reporte.

Para revisar la interfaz con datos ficticios sin tocar PostgreSQL, después de construir las imágenes: `docker compose -f compose.preview.yaml up -d --wait`; abrir `http://localhost:3103`. La copia usa una base SQLite aislada en el contenedor y se descarta con `docker compose -f compose.preview.yaml down`.
Su correo ficticio es `preview@example.test` y su contraseña `Preview-password-2026`. Estos datos de demostración solo existen en esa copia aislada.

El botón **Configuración** en la cabecera permite elegir minutos enteros de concentración (1–180) y descanso (1–60), o restaurar los valores predeterminados de 30 / 5. Las preferencias se guardan en este navegador y se conservan al recargar. Los cambios se aplican al próximo bloque; un bloque activo o pausado conserva su duración original.

En **Configuración**, **Limpiar mi espacio de trabajo** abre una confirmación que advierte de la pérdida permanente de tareas, rutinas, tiempo e historial estadístico. La casilla **Conservar mis etiquetas** está desmarcada inicialmente. Al confirmar, borra todas las tareas en cualquier estado y las rutinas de la cuenta; si marcas la casilla, conserva únicamente el catálogo de etiquetas. No borra la cuenta ni su acceso. El temporizador activo se cierra tras la limpieza.

Al iniciar o reanudar un bloque de trabajo aparece una vista de enfoque que cubre toda la pantalla con un fondo negro degradado. Muestra el título, la cuenta regresiva y los botones **Pausar** y **Terminar**. Pausar (también con Escape) conserva el tiempo restante y regresa a la pantalla normal; **Reanudar** vuelve a la vista de enfoque. Funciona tanto para tareas como para rutinas, y se recupera al recargar si el bloque sigue activo. Al llegar a cero se cierra para mostrar la pregunta de resolución. El descanso permanece en la vista normal.

Durante un bloque de enfoque, **Ventana flotante** muestra la tarea y el contador en una ventana pequeña que permanece encima de otras aplicaciones. Desde allí puedes pausar o volver a la aplicación. Al cerrar la ventana flotante se recupera la vista de enfoque; al pausar o terminar el bloque, la ventana se cierra. La opción aparece únicamente en navegadores compatibles con Document Picture-in-Picture; mantén abierta la pestaña principal mientras usas el contador.

### Rutinas diarias

Durante un bloque de trabajo, **Terminar** está disponible junto a **Pausar** en la vista de enfoque y junto a **Pausar/Reanudar** en la vista normal. Permite finalizar anticipadamente la tarea o rutina, registra un ciclo utilizado y cierra el reloj, sin esperar a cero ni iniciar un descanso. Si falla el guardado, el bloque queda pausado y puede reintentarse sin duplicar ciclos. Durante el descanso no registra otro ciclo de trabajo.

La pestaña **Rutinas diarias** permite crear actividades que se repiten todos los días, como hacer ejercicio, almorzar o leer. La definición de la rutina permanece en PostgreSQL. Cada día tiene una tarea independiente con su propio estado y ciclos: al llegar un nuevo día aparece pendiente con cero ciclos, conservando el registro anterior. El botón **Historial** muestra los últimos 30 registros diarios.

Puedes marcar una rutina como hecha usando su casilla, sin inventar un Pomodoro, o trabajar con su reloj. Desmarcarla conserva los ciclos realmente invertidos. **Desactivar** suspende su repetición y **Volver a activar** la recupera; nada se elimina y reactivarla en el mismo día conserva su progreso.

El día se calcula en `America/Bogota`, definido mediante `APP_TIMEZONE` en Compose. Los registros se generan al consultar las rutinas, sin depender de que el navegador o un programador de tareas esté abierto a medianoche. Mientras la página está abierta, comprueba el cambio de día cada 30 segundos y al recuperar el foco. No se crean registros ficticios para días en que no se accedió a las rutinas. Un bloque que cruza medianoche puede terminar y registrar su esfuerzo en el día en que empezó; no continúa con otro bloque del día anterior. Las tareas puntuales permanecen en la pestaña **Tareas**.

- `frontend/src/modules/focus/components/pomodoro.tsx`: formulario, lista, filtros, métricas, temporizador y modal accesible.
- `frontend/src/modules/focus/tasks.ts`: contratos y cliente HTTP.
- `frontend/src/modules/focus/timer.ts`: máquina de estados del temporizador.
- `frontend/src/app/`: página, layout y estilos Tailwind.
- `frontend/Dockerfile`: compilación por etapas y ejecución sin privilegios.

Crear una tarea con título y prioridad. El reloj inicia 30 minutos y cambia la tarea a **En Progreso**. Al terminar, el contador se detiene hasta responder el modal. Ambas respuestas suman exactamente un ciclo: **Sí** termina la tarea; **No** inicia 5 minutos de descanso. Al terminar el descanso comienza otro bloque de 30 minutos. Pausar y reanudar funciona en trabajo y descanso.

El temporizador usa una fecha límite, evitando que la pestaña en segundo plano distorsione el conteo. Su estado se conserva en localStorage, incluyendo pausa, descanso y respuesta pendiente. Al regresar tras un descanso vencido, comienza un nuevo bloque completo; no se registran bloques ficticios durante la ausencia. Solo hay un temporizador activo en la interfaz. Las métricas representan todos los ciclos registrados, no únicamente los del día.

### Registro e identificación de la cuenta

El registro pide tu nombre, correo electrónico y contraseña. El nombre admite espacios, tildes y mayúsculas, tiene entre 1 y 100 caracteres y puede repetirse entre personas. El sistema muestra «Te damos la bienvenida, Santiago Giraldo» usando el nombre registrado.

El correo es el único identificador para entrar y recuperar acceso. No hay un nombre de usuario. La contraseña tiene de 10 a 128 caracteres; la API informa qué campos corregir sin devolver las credenciales enviadas.


## Color personal

En Configuración, el color elegido se guarda al seleccionarlo y pertenece únicamente a tu cuenta. Se conserva al recargar, cerrar sesión o entrar desde otro navegador, hasta que elijas otro. Las cuentas sin preferencia empiezan en azul. Espera el mensaje de guardado; si hay un error, se restaura el color anterior y puedes reintentar. El modo claro u oscuro mantiene su preferencia separada.
