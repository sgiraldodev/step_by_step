# ADR-005 — Finalización de tareas sin tiempo registrado

## Estado

Aceptado por solicitud del usuario el 2026-09-28.

## Contexto

Hay tareas realizadas fuera del sistema que deben marcarse como terminadas sin
iniciar un Pomodoro. La resolución del reloj suma un ciclo y no representa este caso.

## Decisión

Añadir la acción explícita `complete` al contrato de actualización de tareas.
En tareas puntuales cambia únicamente el estado a `Terminada`, desde pendiente
o en progreso, conservando ciclos y recibos existentes. Repetirla no agrega esfuerzo.
Se mantienen la autorización por propietario y la acción `restore` para reabrir.
Las rutinas conservan `check` con sus validaciones de día y actividad.

El botón **Completar** se deshabilita para la tarea con temporizador local abierto,
incluidas pausa, descanso y decisión pendiente. Las otras tareas siguen disponibles.
No cambia la regla de `resolve` ni se permite completar mediante edición genérica
del estado sin cumplir sus restricciones anteriores.

## Alternativas consideradas

- Resolver un ciclo de cero segundos: inventaría un ciclo no realizado.
- Reutilizar `check`: mezclaría la casilla diaria de rutinas con tareas puntuales.

## Consecuencias

### Positivas

- El estado de una tarea puede reflejar su realización sin falsear las estadísticas.
- Se conserva el historial y la compatibilidad de los contratos anteriores.

### Negativas o costos

- El reloj sigue siendo local: no se detectan temporizadores abiertos en otro dispositivo.

## Impacto

Servicio y schema de tareas, lista de tareas, pruebas y manual. Sin dependencias,
cambios de permisos ni migraciones de base de datos.

## Estrategia de reversión o migración

No hay migración. Retirar la acción y el botón conservaría las tareas ya terminadas
y sus datos; no requiere revertir estados ni eliminar historial.
