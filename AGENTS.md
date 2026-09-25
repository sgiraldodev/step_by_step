# AGENTS.md

## Misión

Trabaja como un agente de ingeniería dentro de este repositorio. Preserva la consistencia, reutiliza patrones existentes y realiza el cambio correcto más pequeño posible.

## Idioma obligatorio

- Toda documentación nueva debe escribirse en español.
- Toda explicación funcional o arquitectónica debe mantenerse en español.
- Se conservan en inglés nombres propios de tecnologías, comandos, librerías, patrones ampliamente aceptados y términos técnicos cuando traducirlos reduzca claridad.
- Los identificadores de código deben seguir las convenciones naturales del lenguaje y del proyecto.

## Contexto bajo demanda

Después de leer este archivo, usa `PROJECT_CONTEXT.md` como índice de enrutamiento y consulta `MEMORY.md` como memoria curada del conocimiento acumulado del proyecto.

- Lee `MEMORY.md` antes de ejecutar la tarea y reutiliza el conocimiento durable que sea relevante.
- Clasifica la tarea en `LIGHT`, `STANDARD` o `FULL`.
- Lee únicamente la documentación y el código directamente relacionados.
- No leas directorios completos, todos los ADR, todos los prompts o todas las Skills por defecto.
- Amplía el contexto solo cuando la inspección revele una dependencia o impacto adicional.
- Las referencias de este archivo indican obligaciones; `PROJECT_CONTEXT.md` decide cuándo son aplicables.

## Flujo obligatorio

Antes de modificar código o documentación:

1. Lee este archivo y cualquier `AGENTS.md` más específico dentro de la ruta objetivo.
2. Lee `PROJECT_CONTEXT.md` y `MEMORY.md`; después inspecciona de forma dirigida la estructura, el código y la documentación relevante.
3. Busca implementaciones equivalentes antes de crear nuevos patrones.
4. Identifica módulos, contratos, datos, permisos, pruebas y documentación afectados.
5. Prioriza reutilizar sobre extender y extender sobre crear.
6. Implementa únicamente los cambios requeridos por la tarea.
7. Ejecuta validaciones relevantes y revisa el diff final.
8. Actualiza documentación cuando cambie el comportamiento o la arquitectura.

## Memoria del proyecto

- `MEMORY.md` conserva decisiones, aprendizajes, restricciones, contexto funcional y estado durable que evite volver a pedir al usuario información ya establecida.
- No uses `MEMORY.md` como sustituto del código vigente, ADR o documentación formal. Ante conflicto, prevalece la fuente de verdad correspondiente y la memoria debe corregirse.
- No registres secretos, credenciales, datos sensibles innecesarios, logs extensos ni resultados temporales de debugging.
- Al cerrar una tarea, actualiza `MEMORY.md` solo si apareció conocimiento reusable en tareas futuras.
- Mantén la memoria compacta: resume y enlaza; si una entrada crece demasiado, promuévela a la documentación formal.
- No conviertas la memoria en un changelog ni en un historial de cada solicitud.

## Skills locales del repositorio

Este repositorio incluye Skills reutilizables bajo `.codex/skills/`.

Cuando una tarea coincida con la descripción de una Skill disponible, úsala como guía procedimental, siempre subordinada a:

1. las instrucciones explícitas del usuario;
2. este `AGENTS.md` y cualquier `AGENTS.md` más específico;
3. la documentación vigente del proyecto y sus ADRs;
4. el Design System y la Definition of Done aplicables.

Las Skills no son una segunda fuente de arquitectura ni de reglas de negocio. Su propósito es aportar método especializado de ejecución.

Skills base disponibles:

- `software-architecture`: arquitectura, límites de módulos, dependencias, contratos y ADRs;
- `project-bootstrap`: bootstrap técnico con backend, frontend, PostgreSQL, Alembic, Docker, testing y CI/CD;
- `design-system`: implementación, reutilización y auditoría del Design System;
- `vertical-slice`: construcción de funcionalidades completas de punta a punta.

Una tarea puede apoyarse en más de una Skill cuando el alcance lo requiera.

## Principios de ingeniería

- No inventes requisitos no respaldados por la documentación del producto o la tarea.
- No introduzcas un nuevo patrón arquitectónico cuando ya exista uno equivalente sin documentar la razón.
- Mantén las reglas de negocio fuera de las capas de transporte o interfaz.
- Mantén módulos cohesionados y dependencias explícitas.
- Evita dependencias y frameworks innecesarios.
- No escribas secretos, tokens ni credenciales directamente en el código.
- Preserva compatibilidad hacia atrás salvo que la tarea modifique explícitamente un contrato.
- Prefiere código claro sobre código ingenioso.
- Agrega o actualiza pruebas para cambios relevantes de comportamiento.
- Aplica `docs/development/coding-standards.md` como estándar obligatorio de calidad estructural.
- Favorece KISS, DRY y YAGNI sin crear abstracciones prematuras.
- Aplica SOLID cuando mejore claridad, cohesión, extensibilidad o testeabilidad.
- No introduzcas código spaghetti, God Classes, God Services, dependencias circulares ni responsabilidades mezcladas.

## Verificación obligatoria de calidad estructural

Antes de considerar terminada una tarea de desarrollo, revisa el cambio completo y corrige cualquier problema material relacionado con:

- código spaghetti o flujo difícil de seguir;
- responsabilidades mezcladas entre transporte, negocio, persistencia y UI;
- violaciones claras de SOLID;
- duplicación relevante de reglas o conocimiento de negocio;
- acoplamiento innecesario entre módulos;
- dependencias circulares;
- funciones, clases, services, hooks o componentes excesivamente grandes;
- condicionales profundamente anidados o complejidad accidental;
- estado global o efectos laterales innecesarios;
- acceso directo a repositories, tablas o detalles internos de otro módulo;
- abstracciones, helpers, capas o dependencias sin una necesidad actual real;
- código difícil de probar debido a diseño deficiente.

Si una estructura existente impide implementar correctamente la tarea, realiza el refactor mínimo necesario dentro del alcance o informa el bloqueo antes de introducir más deuda técnica.

No marques una tarea como completada únicamente porque compile o porque las pruebas pasen si el cambio introduce un problema estructural evidente.

## Operaciones destructivas

Las operaciones destructivas requieren autorización explícita del usuario en el momento de ejecutarlas, incluso si la tarea general ya fue aprobada.

Esto incluye, entre otras:

- eliminación de datos;
- eliminación de tablas, columnas o estructuras persistentes;
- truncados masivos;
- reseteos de ambientes;
- restauraciones sobre ambientes reales;
- reemplazo irreversible de información;
- comandos o migraciones con impacto destructivo relevante.

### Regla crítica sobre bases de datos

**Nunca eliminar, resetear, vaciar, recrear destructivamente ni reemplazar una base de datos sin autorización explícita del usuario.**

Esta prohibición aplica a todos los ambientes y no puede inferirse de una aprobación previa más general. Si una operación propuesta pudiera provocar pérdida total o parcial de datos, debe detenerse antes de ejecutarla y solicitar autorización específica.

## Gobierno de arquitectura

Las decisiones que afecten materialmente la arquitectura deben documentarse en `docs/architecture/decisions/` usando la plantilla ADR.

También deben considerarse ADR para cambios relevantes de reglas de negocio cuando afecten comportamiento central, varios módulos, contratos importantes o decisiones difíciles de revertir.

La arquitectura específica de un proyecto puede apartarse de los valores por defecto del starter, pero toda desviación debe ser intencional, justificada y documentada.

## Gobierno de interfaz

Antes de crear o modificar UI:

- Usa la ruta de UI de `PROJECT_CONTEXT.md`: lee siempre el Design System y agrega las guías UX solo cuando cambien interacción, responsive o accesibilidad.
- Reutiliza componentes y tokens existentes.
- No crees componentes visuales casi duplicados.
- Conserva accesibilidad, responsive behavior y estados de carga, error, vacío, deshabilitado y permisos.

## Definition of Done

Una tarea no se considera terminada hasta cumplir, cuando aplique, `docs/development/definition-of-done.md`.
