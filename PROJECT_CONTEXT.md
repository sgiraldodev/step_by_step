# PROJECT_CONTEXT.md

## Propósito

Este archivo es el mapa mínimo de contexto del repositorio. Permite que agentes y asistentes carguen únicamente la información necesaria para la tarea actual.

No duplica arquitectura ni reglas de negocio. Las fuentes de verdad siguen siendo los documentos enlazados y el código vigente.

## Contexto mínimo obligatorio

Para cualquier tarea:

1. Lee `AGENTS.md` y el `AGENTS.md` más específico de la ruta afectada, si existe.
2. Lee este archivo.
3. Lee `MEMORY.md` para recuperar decisiones, aprendizajes y contexto durable ya establecido.
4. Clasifica la tarea como `LIGHT`, `STANDARD` o `FULL`.
5. Identifica archivos, módulos, contratos y documentación directamente afectados.
6. Carga únicamente las rutas indicadas por este mapa que sean necesarias.
7. Amplía el contexto solo cuando encuentres evidencia concreta de otra dependencia o impacto.

No leas carpetas completas por defecto. No cargues todos los ADR, prompts, Skills o documentos “por si acaso”.

## Niveles de contexto

### LIGHT

Cambios locales y de bajo riesgo: textos, estilos acotados, validaciones pequeñas, documentación o bugs aislados.

Carga el archivo afectado, sus dependencias inmediatas, un patrón equivalente y la guía específica aplicable. Ejecuta validaciones focalizadas.

### STANDARD

Nivel predeterminado para funcionalidades, módulos y vertical slices.

Carga reglas de producto relacionadas, arquitectura de los módulos afectados, contratos públicos, estándares de código, Design System si hay UI y estrategia de pruebas aplicable. No incluye documentación operacional si no cambia infraestructura o despliegue.

### FULL

Solo para cambios transversales, releases, seguridad crítica, migraciones complejas, cambios de arquitectura, multi-tenant, infraestructura o incidentes con impacto amplio.

Puede requerir varias áreas documentales y una validación integral, pero continúa siendo una lectura dirigida: selecciona los ADR y documentos relacionados, no directorios completos.

## Enrutamiento por tipo de tarea

| Si la tarea afecta… | Consulta… |
|---|---|
| Conocimiento acumulado, decisiones previas, restricciones o aprendizajes | `MEMORY.md`; valida contra la fuente de verdad enlazada cuando la tarea dependa de ese dato |
| Visión, alcance, actores o reglas funcionales | `docs/product/product-brief.md`, `docs/product/requirements.md` y secciones pertinentes de `docs/product/glossary.md` |
| Límites de módulos, capas, dependencias o transacciones | `docs/architecture/architecture.md` |
| Stack, librerías base o estructura técnica | `docs/architecture/stack-tecnologico.md` |
| Endpoints, contratos HTTP o schemas públicos | `docs/architecture/api-convenciones.md` |
| Identidad, permisos, tenant o datos sensibles | `docs/architecture/seguridad-autenticacion.md` |
| Proveedores o servicios externos | `docs/architecture/integraciones.md`; agrega `configuracion-observabilidad.md` solo si cambia configuración, logs, métricas o health checks |
| Decisión material o difícil de revertir | Solo los ADR relacionados en `docs/architecture/decisions/`; usa `ADR-template.md` si corresponde crear uno |
| UI, componentes, tokens o estilos | `docs/design/design-system.md`; agrega `docs/design/ux-guidelines.md` si cambia interacción, responsive o accesibilidad |
| Calidad y estructura del código | Secciones necesarias de `docs/development/coding-standards.md` |
| Pruebas | `docs/development/testing-strategy.md` y pruebas cercanas al cambio |
| Criterio de cierre | Secciones aplicables de `docs/development/definition-of-done.md` |
| Git, versión, ramas o TAG | `docs/development/git-strategy.md` |
| Docker o ambiente local | `docs/operations/environments.md` |
| CI/CD o despliegue | `docs/operations/deployment.md`; agrega ambientes y Git solo si intervienen |
| Backup, restauración o riesgo de pérdida | `docs/operations/backup-restore.md` y las restricciones destructivas de `AGENTS.md` |
| Inicio técnico del proyecto | `docs/development/checklist-inicio-proyecto.md` y únicamente las áreas anteriores que el bootstrap vaya a materializar |
| Tarea repetible guiada por prompt | `docs/prompts/_reglas-globales.md` y el único prompt específico aplicable |
| Método especializado | La única Skill de `.codex/skills/` cuya descripción coincida; combina Skills solo si la tarea cruza realmente sus responsabilidades |

## Rutas específicas de este proyecto

- Para comportamiento visible al usuario: `docs/product/manual-usuario.md`.
- Para la migración del Pomodoro: `docs/architecture/decisions/ADR-001-migracion-pomodoro.md` y `docs/development/migracion-pomodoro.md`.
- Para correo y nombre personal: `docs/architecture/decisions/ADR-002-correo-y-nombre-personal.md`.
- No cargues estas rutas para tareas que no afecten esos temas.

## Descubrimiento en el código

Antes de ampliar documentación:

1. localiza el módulo o archivo objetivo;
2. revisa imports, contratos y pruebas cercanas;
3. busca una implementación equivalente;
4. usa `git diff`, historial o logs acotados cuando aporten evidencia;
5. añade otra ruta documental solo si esa inspección demuestra impacto.

## Regla de detención

Deja de cargar contexto cuando ya puedas responder:

- qué comportamiento debe cambiar;
- dónde vive la responsabilidad;
- qué contrato o dato puede verse afectado;
- qué patrón existente debe reutilizarse;
- qué validación demuestra que funciona.

Si falta una respuesta, amplía únicamente hacia la fuente que pueda resolverla.

## Mantenimiento

Mantén `MEMORY.md` sincronizado cuando una tarea produzca conocimiento durable que deba reutilizarse. No dupliques allí documentación extensa: resume y enlaza la fuente formal.

Actualiza este mapa cuando se cree, mueva o retire una fuente de verdad o aparezca una categoría estable de trabajo. No copies aquí otros documentos: conserva solo rutas, criterios de selección y dependencias.
