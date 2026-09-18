# Crear vertical slice completa

## Objetivo

Construir una funcionalidad completa de punta a punta, desde persistencia y lógica de negocio hasta API, frontend, permisos y pruebas, respetando los estándares del proyecto y evitando procesamiento innecesario.

## Modo de ejecución

La vertical slice usa `STANDARD` por defecto durante desarrollo. `FULL` se reserva para cierre/release o cuando exista impacto transversal, migración compleja, riesgo alto o una razón técnica verificable.

## Instrucciones

Antes de modificar código:

1. Lee `AGENTS.md`, `docs/prompts/_reglas-globales.md` y únicamente la documentación directamente relacionada con el caso de uso.
2. Revisa arquitectura, Design System, testing y Definition of Done solo en las secciones que afecten la slice.
3. Inspecciona los módulos relacionados y reutiliza patrones existentes; no explores el repositorio completo si no es necesario.
4. Presenta una propuesta breve y ejecutiva con:
   - alcance de la funcionalidad;
   - módulos o áreas afectadas;
   - cambios de base de datos, API, permisos o integraciones;
   - riesgos relevantes;
   - modo de ejecución propuesto;
   - resultado esperado;
   - necesidad de ADR si aplica.
5. Espera una única aprobación del usuario antes de ejecutar.

Después de la aprobación, implementa de punta a punta sin pedir confirmaciones intermedias, salvo que aparezca una regla de negocio material no definida, una contradicción, una operación destructiva no autorizada o un bloqueo técnico que cambie el alcance aprobado.

## Optimización obligatoria

- Reutiliza los contenedores y servicios Docker ya levantados cuando estén sanos.
- No crees stacks, bases de datos o contenedores adicionales solo para pruebas si el entorno existente puede ejecutar las pruebas de forma aislada.
- No reconstruyas imágenes Docker si no cambiaron Dockerfiles, dependencias o artefactos que obliguen rebuild.
- No uses recreación forzada, limpieza de volúmenes o `--no-cache` salvo necesidad técnica explícita.
- Ejecuta primero tests unitarios del código afectado, luego integración específica y E2E del flujo modificado cuando aplique.
- No ejecutes toda la suite repetidamente durante la implementación. Reserva validación completa para cierre de cambios transversales, PR/release o evidencia de regresión amplia.
- No repitas una validación cuyo resultado siga siendo válido si desde entonces no cambió su superficie de impacto.
- Inspecciona logs por segmentos relevantes antes de procesarlos completos.
- No lances subagentes o subtareas paralelas salvo que exista una ganancia clara de tiempo o independencia real del trabajo.

## Alcance técnico esperado

Cuando aplique, la vertical slice debe incluir:

- modelos SQLAlchemy;
- schemas Pydantic;
- repositorio;
- servicio con reglas de negocio;
- excepciones específicas;
- endpoints REST versionados;
- permisos RBAC;
- migraciones Alembic;
- integración con tenant activo cuando el proyecto sea multi-tenant;
- frontend organizado por feature;
- cliente API centralizado;
- TanStack Query para server state;
- React Hook Form + Zod para formularios;
- componentes reutilizables desde `components/ui`;
- TanStack Table cuando aplique;
- manejo de errores y feedback de UI consistente;
- pruebas unitarias, integración y E2E cuando correspondan;
- actualización de documentación relevante;
- validación de la Definition of Done con alcance proporcional al riesgo.

## Principios

- No inventes requisitos.
- No dupliques componentes o patrones existentes.
- No pongas reglas de negocio en `router.py` ni lógica de persistencia en `service.py`.
- No accedas directamente al repository de otro módulo; coordina mediante servicios.
- No uses `HTTPException` dentro de servicios.
- No hagas `commit()` automático en repositorios.
- Respeta aislamiento multi-tenant y permisos efectivos.
- Usa `snake_case` en API y base de datos.
- Toda modificación de esquema debe pasar por Alembic.
- Todo cambio importante de arquitectura o regla de negocio debe considerar ADR.

## Criterio de finalización

La funcionalidad se considera completa cuando el flujo funciona de punta a punta, las pruebas relevantes pasan y cumple la Definition of Done aplicable. Una suite completa no es obligatoria para cada iteración local si la estrategia incremental ya ofrece evidencia suficiente; sí debe ejecutarse cuando corresponda por riesgo, alcance o preparación de release.
