# Prompt estándar — Agregar funcionalidad

## Prompt

Quiero agregar una nueva funcionalidad a un módulo existente.

Antes de modificar código:

1. Lee `AGENTS.md` y la documentación vigente.
2. Inspecciona el módulo afectado y sus dependencias.
3. Identifica la regla de negocio, comportamiento actual, permisos, contratos API, componentes UI y pruebas existentes relacionados.
4. Reutiliza estructuras y componentes antes de crear otros nuevos.
5. Mantén la arquitectura `router → service → repository → model/schema`.
6. No pongas reglas de negocio en routers, schemas, componentes o repositorios.
7. Si cambia una regla de negocio importante o comportamiento transversal, documenta la decisión mediante ADR cuando aplique.
8. Actualiza backend, frontend, permisos, pruebas y documentación solo en el alcance necesario.
9. Conserva compatibilidad con contratos existentes salvo que el cambio sea intencional y documentado.
10. Valida Definition of Done.

Entrega:
- impacto funcional y técnico;
- archivos afectados;
- implementación;
- pruebas agregadas o actualizadas;
- documentación modificada;
- riesgos o compatibilidades relevantes.
