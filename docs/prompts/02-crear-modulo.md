# Prompt estándar — Crear módulo

## Prompt

Quiero construir un nuevo módulo dentro de la aplicación.

Antes de implementar:

1. Lee `AGENTS.md`, arquitectura, Design System, convenciones API, seguridad, testing y Definition of Done.
2. Revisa módulos existentes y reutiliza patrones, componentes, servicios, validaciones y convenciones.
3. Confirma dependencias con otros módulos y evita acceso directo a repositorios o tablas ajenas.
4. Mantén la estructura estándar del módulo: `router.py`, `service.py`, `repository.py`, `models.py`, `schemas.py`, `dependencies.py`, `exceptions.py` cuando aplique.
5. Separa validaciones estructurales en Pydantic y reglas de negocio en `service.py`.
6. Usa UUID, auditoría, soft delete y `tenant_id` si el proyecto tiene multi-tenancy activo.
7. Diseña endpoints REST versionados, paginación, filtros, sorting y operaciones bulk cuando apliquen.
8. Define permisos RBAC granulares para lectura, creación, actualización, eliminación y acciones especiales.
9. En frontend, organiza el módulo por feature, reutiliza `components/ui`, Design System, TanStack Query, React Hook Form + Zod y cliente HTTP centralizado.
10. Agrega tests unitarios, integración y E2E críticos cuando aporten valor.
11. Actualiza documentación y ADR si hay decisiones arquitectónicas o reglas de negocio relevantes.
12. Valida la Definition of Done antes de marcar el módulo como terminado.

Entrega:
- diseño funcional del módulo;
- modelo de datos;
- permisos;
- endpoints;
- estructura backend/frontend;
- implementación;
- pruebas;
- documentación actualizada;
- resumen de decisiones y riesgos.
