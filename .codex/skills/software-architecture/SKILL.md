---
name: software-architecture
description: Revisar, definir o ajustar arquitectura de software dentro de este repositorio. Usar cuando una tarea afecte módulos, límites de dominio, dependencias, persistencia, APIs, multi-tenant, integraciones, seguridad transversal, ADRs o decisiones técnicas difíciles de revertir.
---

# Software Architecture

## Propósito

Aplicar la arquitectura vigente del proyecto y detectar desviaciones antes de introducir nuevos patrones. Esta Skill aporta método de análisis arquitectónico; la fuente de verdad sigue siendo la documentación del repositorio.

## Antes de actuar

Lee `AGENTS.md` y `PROJECT_CONTEXT.md`. Empieza por `docs/architecture/architecture.md` y agrega únicamente la fuente específica: stack si cambian tecnologías; API si cambia HTTP; seguridad si intervienen identidad, permisos o tenant; integraciones si hay proveedor externo; producto si una regla funcional determina la decisión; y solo los ADR relacionados.

No cargues toda la carpeta de arquitectura ni todos los ADR. No sustituyas una decisión específica del proyecto por una preferencia genérica de esta Skill.

## Método

1. Identifica el cambio solicitado y los módulos afectados.
2. Busca implementación o patrón equivalente antes de crear uno nuevo.
3. Verifica límites de responsabilidad entre módulos y capas.
4. Identifica contratos afectados: API, persistencia, eventos, integraciones, permisos y configuración.
5. Evalúa compatibilidad hacia atrás y marca cualquier `breaking change`.
6. Evalúa consistencia transaccional, aislamiento de tenant y seguridad cuando apliquen.
7. Determina si la decisión requiere ADR.
8. Propón el cambio más pequeño que preserve cohesión, mantenibilidad y trazabilidad.

## Reglas estructurales por defecto

Cuando la arquitectura del proyecto no indique otra cosa:

```text
router → service → repository → persistence
```

- `router` maneja transporte HTTP, no reglas de negocio.
- `service` contiene reglas de aplicación, permisos y coordinación transaccional.
- `repository` encapsula persistencia y no hace `commit()` automáticamente.
- modelos SQLAlchemy y schemas Pydantic permanecen separados.
- un módulo consume otro mediante su servicio público, no mediante su repository o tablas internas.
- dependencias transversales viven en `app/core/`.
- integraciones externas se encapsulan en `app/integrations/` cuando aplique.

## Señales que requieren atención especial

Trata como cambios arquitectónicos relevantes, entre otros:

- introducir microservicios, colas o eventos distribuidos;
- cambiar base de datos, ORM o framework principal;
- crear dependencia circular o acceso directo entre repositories de módulos;
- modificar estrategia multi-tenant;
- cambiar autenticación, autorización o modelo de permisos;
- modificar contratos públicos de API de forma incompatible;
- introducir un nuevo patrón transversal;
- cambiar ownership de datos entre módulos.

## ADR

Crea o actualiza un ADR cuando la decisión sea material, difícil de revertir, afecte varios módulos o cambie una regla arquitectónica central. No generes ADRs para decisiones locales y reversibles sin impacto amplio.

## Operaciones destructivas

Respeta estrictamente `AGENTS.md`. Nunca interpretes una aprobación arquitectónica como autorización para borrar, resetear, truncar o recrear datos o bases de datos.

## Resultado esperado

La solución debe encajar en la arquitectura vigente, minimizar acoplamiento y dejar claros los contratos y responsabilidades afectados sin introducir complejidad innecesaria.
