# Prompt estándar — Crear endpoint

## Prompt

Quiero crear o modificar un endpoint de la API.

1. Lee `AGENTS.md`, `docs/architecture/api-convenciones.md`, seguridad y arquitectura.
2. Revisa si ya existe un endpoint o servicio reutilizable.
3. Mantén rutas REST versionadas en `/api/v1`, nombres plurales y `snake_case` en JSON.
4. Usa `PATCH` para actualizaciones parciales y operaciones `bulk` cuando el caso realmente lo requiera.
5. Mantén validación estructural en Pydantic y reglas de negocio en `service.py`.
6. No lances `HTTPException` desde servicios; usa excepciones de aplicación/dominio y mapeo centralizado.
7. Aplica permisos RBAC, tenant activo y trazabilidad cuando corresponda.
8. Usa la sesión SQLAlchemy por request y deja commit/rollback bajo control del servicio.
9. Agrega pruebas del contrato, errores esperados, permisos y casos críticos.
10. Actualiza OpenAPI/documentación y valida Definition of Done.

Entrega:
- contrato del endpoint;
- request/response;
- códigos de error;
- permisos;
- implementación;
- pruebas;
- documentación afectada.
