# Instrucciones para asistentes de código

Trabaja siguiendo `AGENTS.md` y usa `PROJECT_CONTEXT.md` como mapa obligatorio de contexto.

## Carga de contexto

- Clasifica la tarea como `LIGHT`, `STANDARD` o `FULL`.
- Lee solo documentación, código, ADR y Skills directamente relacionados.
- No recorras carpetas completas ni cargues toda la documentación por defecto.
- Amplía el contexto únicamente cuando exista evidencia de impacto adicional.
- Busca una implementación equivalente antes de crear algo.

## Reglas obligatorias

- Toda explicación y documentación debe estar en español.
- Reutiliza componentes, servicios, utilidades y patrones existentes.
- Aplica arquitectura, seguridad, Design System, pruebas y Definition of Done cuando `PROJECT_CONTEXT.md` los enrute para la tarea.
- No introduzcas dependencias nuevas sin necesidad clara.
- No coloques lógica de negocio en controllers/routers ni componentes visuales.
- No escribas secretos en el repositorio.
- Agrega o actualiza pruebas cuando cambie comportamiento relevante.
- Si una decisión técnica se aparta del stack estándar o tiene impacto transversal, crea un ADR.
