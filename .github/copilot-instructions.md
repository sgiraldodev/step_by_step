# Instrucciones para asistentes de código

Trabaja siguiendo `AGENTS.md` y la documentación del repositorio.

## Reglas obligatorias

- Toda explicación y documentación debe estar en español.
- Antes de crear algo, busca primero una implementación equivalente.
- Reutiliza componentes, servicios, utilidades y patrones existentes.
- Respeta `docs/architecture/architecture.md` y `docs/architecture/stack-tecnologico.md`.
- Para UI, respeta `docs/design/design-system.md` y `docs/design/ux-guidelines.md`.
- No introduzcas dependencias nuevas sin necesidad clara.
- No coloques lógica de negocio en controllers/routers ni componentes visuales.
- No escribas secretos en el repositorio.
- Agrega o actualiza pruebas cuando cambie comportamiento relevante.
- Si una decisión técnica se aparta del stack estándar o tiene impacto transversal, crea un ADR.
- Antes de terminar, valida el cambio contra `docs/development/definition-of-done.md`.
