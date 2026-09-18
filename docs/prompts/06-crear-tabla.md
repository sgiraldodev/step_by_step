# Prompt estándar — Crear tabla o listado

## Prompt

Quiero crear o modificar una tabla/listado de datos.

1. Lee `AGENTS.md`, Design System, UX guidelines y convenciones API.
2. Revisa tablas existentes y reutiliza patrones visuales y funcionales.
3. Usa TanStack Table para lógica avanzada y `components/ui` para la presentación.
4. Usa TanStack Query para datos remotos.
5. Soporta paginación, filtros, búsqueda, sorting y selección solo cuando el caso lo requiera.
6. Para acciones masivas, usa endpoints bulk explícitos; no dispares N requests individuales si existe una operación natural masiva.
7. Incluye estados de loading, empty, error, sin permisos y resultados sin coincidencias.
8. Mantén consistencia en densidad, encabezados, acciones, paginación y responsive behavior.
9. Respeta permisos por acción y tenant activo.
10. Agrega pruebas del comportamiento crítico y valida Definition of Done.

Entrega:
- columnas y acciones;
- filtros/paginación;
- integración API;
- comportamiento bulk si aplica;
- estados UX;
- pruebas.
