# Requisitos

## Funcionalidades migradas

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-001 | Cuenta privada | Registro con nombre personal y correo único; acceso y recuperación exclusivamente por correo, sesiones opacas HttpOnly y aislamiento por propietario. El nombre admite espacios y no debe ser único. |
| RF-002 | Recuperación de acceso | Código personal rotativo y correo opcional con enlace de un uso y 30 minutos de vigencia; se revocan sesiones al restablecer. |
| RF-003 | Tareas y prioridades | Crear y editar títulos, prioridades Baja/Media/Alta/Urgente y etiquetas; conservar estados y ciclos. |
| RF-004 | Temporizador | Trabajo/descanso configurables, pausa/reanudación, persistencia por usuario y modo de enfoque. |
| RF-005 | Resolución idempotente | Cada UUID de operación registra un solo ciclo y rechaza reutilización con datos diferentes. |
| RF-006 | Cambio y restauración | Interrumpir guarda segundos efectivos sin completar ni sumar ciclos; restaurar conserva historial. |
| RF-007 | Rutinas diarias | Un registro por rutina y día consultado en Bogotá; activar/desactivar conserva historial; el bloque nocturno puede finalizar en su registro original. |
| RF-008 | Etiquetas | Hasta 10 por actividad, deduplicación por propietario y nombre normalizado; editar conserva las etiquetas históricas del esfuerzo. |
| RF-009 | Estadísticas | Rango inclusivo hasta 367 días, filtros y reparto igual por etiquetas; excluir pausas/descansos y ciclos antiguos sin duración. |
| RF-010 | Tema | Claro/oscuro con preferencia persistida y valor inicial del sistema. |

## Requisitos no funcionales

| ID | Condición |
|---|---|
| RNF-001 | Monolito modular; routers sin SQL ni reglas de negocio; repositories sin commit; una AsyncSession por request. |
| RNF-002 | API canónica `/api/v1`, PATCH para edición y alias históricos compatibles. |
| RNF-003 | Configuración tipada central, secretos fuera del repositorio, rate limiting y cookies HttpOnly. |
| RNF-004 | Docker reproducible, migraciones explícitas, `/health`, `/ready` y logs con request ID. |
| RNF-005 | Tokens y componentes visuales reutilizados; foco visible, teclado, estados completos y responsive. |
| RNF-006 | Pruebas funcionales y de regresión, cobertura, lint, formato, TypeScript, build y CI. |

No se añaden reglas funcionales nuevas por migrar la estructura. El despliegue público y los roles compartidos quedan fuera de alcance.

## Saludo personalizado

Al ingresar se muestra «Te damos la bienvenida, {nombre}» con el nombre registrado. Se conserva la grafía personal y se eliminan espacios exteriores. No se deduce el género a partir del nombre.
