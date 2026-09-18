---
name: vertical-slice
description: Implementar una funcionalidad real completa de punta a punta dentro del proyecto. Usar cuando una tarea deba atravesar frontend, API, service, repository, persistencia, permisos, validaciones, Design System, pruebas y documentación como un único objetivo funcional.
---

# Vertical Slice

## Propósito

Construir una funcionalidad completa y verificable de extremo a extremo, evitando desarrollar capas aisladas y evitando trabajo innecesario de contexto, Docker y pruebas.

Esta Skill debe aplicar las decisiones vigentes del proyecto y coordinar otras capacidades especializadas cuando sean relevantes, especialmente arquitectura y Design System.

## Modo de ejecución

Usa `STANDARD` por defecto. Cambia a `FULL` solo cuando el impacto sea transversal, exista riesgo alto, migración compleja, seguridad crítica o se esté preparando release. Para ajustes locales dentro de una slice puede usarse `LIGHT`.

## Antes de actuar

Lee:

- `AGENTS.md`;
- `docs/prompts/_reglas-globales.md`;
- `docs/prompts/16-crear-vertical-slice.md` cuando exista;
- requisitos y reglas de negocio directamente relacionados;
- secciones de arquitectura, Design System, testing y DoD que afecten el flujo;
- ADRs aplicables.

No releas documentación o módulos no relacionados si el alcance puede resolverse con inspección dirigida.

## Regla principal

Una vertical slice debe entregar un comportamiento funcional completo, no simplemente una colección de archivos.

Flujo de referencia:

```text
UI
→ cliente API
→ endpoint REST
→ service
→ repository
→ PostgreSQL
→ respuesta
→ actualización de UI
```

Atravesado por autenticación, permisos/aislamiento, validaciones, manejo de errores, observabilidad, pruebas y documentación cuando correspondan.

## Preparación

1. Identifica el caso de uso exacto.
2. Relaciónalo con requisitos y reglas de negocio existentes.
3. Deriva entre 3 y 7 criterios de aceptación verificables.
4. Identifica módulos afectados y dependencias públicas.
5. Detecta decisiones abiertas que realmente bloqueen el flujo.
6. Evalúa impacto en datos, API, permisos, integraciones y UI.
7. Marca cualquier `breaking change`.
8. Si el alcance es grande, divide la ejecución en fases manteniendo un único objetivo funcional, sin multiplicar innecesariamente entornos o agentes.

## Eficiencia obligatoria

- reutiliza contenedores y servicios Docker sanos ya existentes;
- no crees stacks o bases de datos adicionales solo para pruebas si el entorno actual puede aislarlas correctamente;
- no reconstruyas imágenes si no cambiaron Dockerfile, dependencias o artefactos relevantes;
- evita `--force-recreate`, `--no-cache` y limpiezas de volúmenes salvo necesidad explícita;
- usa `git diff`, archivos afectados y logs acotados antes de inspecciones globales;
- no repitas análisis, builds o pruebas si su superficie no cambió;
- no lances subagentes salvo que exista independencia real y beneficio claro.

## Backend

Implementa solo lo necesario para el caso de uso:

- modelos SQLAlchemy cuando exista nueva persistencia;
- schemas Pydantic separados por intención;
- repository propio del módulo;
- service con reglas de negocio y transacción;
- excepciones del dominio/aplicación;
- endpoints REST versionados;
- permisos y aislamiento correspondientes;
- migraciones Alembic cuando cambie el esquema.

No lances `HTTPException` desde services. No permitas `commit()` automático desde repositories.

## Persistencia y transacciones

Usa una sesión por request y conserva atomicidad cuando una operación tenga múltiples efectos.

Toda modificación destructiva está sujeta a autorización explícita según `AGENTS.md`. Una migración necesaria para la vertical slice no autoriza pérdida de datos.

## Frontend

Implementa el flujo completo utilizando la estructura por feature, cliente HTTP centralizado, server state vigente, validación de formularios, componentes y tokens oficiales del Design System, y estados de UX necesarios.

No recrees localmente componentes ya existentes.

## Seguridad

Valida siempre en backend identidad, permisos efectivos, ownership o tenant activo, acceso a recursos relacionados, entradas y estados permitidos.

Ocultar controles en frontend no sustituye autorización.

## Pruebas incrementales

Valida en este orden cuando aplique:

1. unitarias del código afectado;
2. integración de los módulos afectados;
3. E2E del flujo modificado;
4. suite amplia solo cuando el riesgo o preparación de PR/release lo requiera.

No repitas una prueba cuyo resultado siga siendo válido si desde entonces no cambió ninguna superficie que pueda afectarla.

## Integraciones

Si la vertical slice consume un proveedor externo, utiliza la abstracción definida en `app/integrations/` o equivalente. No llames SDKs externos directamente desde routers o repositories.

## Documentación

Actualiza automáticamente solo la documentación realmente afectada por cambios en reglas, contratos, permisos, configuración, migraciones, arquitectura, integraciones o Design System.

Evalúa ADR cuando la decisión sea material o difícil de revertir.

## Validación final

Antes de considerar terminada la slice verifica proporcionalmente al riesgo:

- el flujo funciona de punta a punta;
- no existen efectos duplicados inesperados;
- permisos y aislamiento son correctos;
- migraciones aplican de forma controlada;
- UI y API manejan errores esperados;
- responsive y accesibilidad se validaron cuando aplican;
- pruebas relevantes pasan;
- la Definition of Done aplicable se cumple.

## Fuera de alcance

No aproveches una vertical slice para implementar mejoras adyacentes no aprobadas. Sugiere esas mejoras aparte conforme a las reglas globales.

## Resultado esperado

Un usuario puede completar el caso de uso real definido con persistencia, seguridad, experiencia y pruebas integradas, usando el menor procesamiento necesario para obtener evidencia suficiente de calidad.
