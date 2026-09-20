# Biblioteca estándar de prompts

## Objetivo

Esta carpeta contiene prompts reutilizables para ejecutar tareas frecuentes de desarrollo de forma consistente entre proyectos.

Los prompts no sustituyen `AGENTS.md`, la arquitectura, el Design System ni la Definition of Done. Los complementan. Antes de ejecutar cualquiera, el agente debe usar `PROJECT_CONTEXT.md` para cargar solo las reglas aplicables y adaptar el trabajo al contexto real del proyecto.

## Reglas compartidas

Todos los prompts de esta carpeta heredan obligatoriamente `docs/prompts/_reglas-globales.md`.

Ese documento es la fuente única para el comportamiento común de los prompts: propuesta previa, aprobación única, criterios de aceptación, clasificación de riesgo, breaking changes, tratamiento de ambigüedades, tareas grandes, cambios fuera de alcance, documentación, pruebas y operaciones destructivas.

Los prompts específicos deben evitar duplicar esas reglas salvo cuando una instrucción propia del caso necesite reforzarlas.

## Cómo usarlos

Ejemplo:

```text
Aplica docs/prompts/02-crear-modulo.md para construir el módulo de Proveedores.

Contexto funcional:
- ...
- ...
```

El usuario no debe repetir reglas ya definidas en el repositorio. El prompt debe reutilizar la documentación existente y pedir aclaraciones solo cuando falte una decisión funcional que cambie materialmente el resultado.

## Flujo recomendado para un proyecto nuevo

```text
01-iniciar-proyecto
→ completar producto, alcance, requisitos y decisiones base
→ 17-bootstrap-tecnico-proyecto
→ dejar entorno técnico ejecutable y reproducible
→ 16-crear-vertical-slice
→ validar la primera funcionalidad end-to-end
→ 02-crear-modulo / 03-agregar-funcionalidad
→ desarrollo incremental normal
```

## Catálogo

1. `01-iniciar-proyecto.md`: iniciar un proyecto nuevo desde el starter.
2. `02-crear-modulo.md`: construir un módulo nuevo end-to-end.
3. `03-agregar-funcionalidad.md`: extender un módulo existente.
4. `04-crear-endpoint.md`: agregar o modificar un endpoint de API.
5. `05-crear-formulario.md`: construir formularios consistentes con el Design System.
6. `06-crear-tabla.md`: construir tablas/listados avanzados.
7. `07-crear-integracion.md`: incorporar servicios externos.
8. `08-crear-migracion.md`: implementar cambios de esquema con Alembic.
9. `09-corregir-bug.md`: diagnosticar y corregir defectos con prueba de regresión.
10. `10-refactorizar.md`: mejorar estructura sin cambiar comportamiento esperado.
11. `11-crear-tests.md`: ampliar o reparar cobertura automatizada.
12. `12-preparar-release.md`: preparar una versión para staging/producción.
13. `13-hotfix-produccion.md`: corregir urgentemente una versión productiva.
14. `14-revisar-funcionalidad.md`: auditar una funcionalidad contra arquitectura, seguridad, UX y DoD.
15. `15-cambio-regla-negocio.md`: implementar cambios relevantes de reglas de negocio con trazabilidad y ADR cuando aplique.
16. `16-crear-vertical-slice.md`: construir una funcionalidad completa de punta a punta; si el alcance es grande, dividirla en fases dentro de la propuesta manteniendo un único objetivo funcional.
17. `17-bootstrap-tecnico-proyecto.md`: preparar la base ejecutable del proyecto con backend, frontend, PostgreSQL, Alembic, Docker, testing, calidad, observabilidad y CI/CD sin inventar funcionalidades de negocio.

## Regla común

La secuencia estándar vive en `_reglas-globales.md` y debe interpretarse, a alto nivel, así:

```text
clasificar LIGHT / STANDARD / FULL
→ enrutar con PROJECT_CONTEXT.md
→ revisar documentación necesaria
→ inspeccionar implementación existente
→ reutilizar antes de crear
→ proponer
→ obtener aprobación
→ implementar
→ probar
→ documentar
→ validar Definition of Done
```
