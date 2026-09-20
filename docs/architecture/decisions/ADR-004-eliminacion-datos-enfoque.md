# ADR-004 — Eliminación de datos de enfoque por propietario

## Estado

Aceptado.

## Contexto

ADR-001 conservaba todo el historial y no ofrecía borrado. El usuario requiere eliminar tareas pendientes o en progreso y poder limpiar su espacio de trabajo, incluidas las estadísticas, con la posibilidad de conservar etiquetas.

## Decisión

Se permite eliminar definitivamente una tarea puntual pendiente o en progreso tras confirmación. Se eliminan sus relaciones con etiquetas y sus recibos de ciclos, por lo que su tiempo desaparece de las estadísticas. Las tareas terminadas y los registros diarios de rutinas no admiten borrado individual.

La limpieza del espacio elimina en una sola transacción los recibos, relaciones, tareas de cualquier estado y rutinas del propietario autenticado. El catálogo de etiquetas se conserva solo cuando el usuario marca **Conservar mis etiquetas**. La identidad, sesión y preferencias personales no se eliminan. La operación se limita por propietario en la capa de persistencia y la interfaz exige una confirmación explícita.

## Alternativas consideradas

- Ocultar tareas sin borrar recibos: mantendría estadísticas que el usuario pidió eliminar.
- Borrar la cuenta completa: excede el alcance y quitaría el acceso.
- Borrar cada registro desde el navegador: permitiría resultados parciales ante fallos.

## Consecuencias

La eliminación es irreversible sin un respaldo. No se necesitan cambios de esquema. Las estadísticas existentes se recalculan a partir de los recibos restantes. El temporizador local se cierra tras un borrado exitoso del bloque activo o una limpieza completa.

## Impacto

Módulo `focus`, API, cliente frontend, confirmaciones visuales, pruebas y manual de usuario. No se modifica el módulo de identidad.

## Estrategia de reversión o migración

No hay migración de base de datos. Un respaldo externo previo sería necesario para recuperar información eliminada; esta decisión no autoriza ejecutar borrados sobre datos reales durante desarrollo o validación.
