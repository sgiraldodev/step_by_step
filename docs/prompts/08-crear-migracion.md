# Prompt estándar — Crear migración

## Prompt

Quiero implementar un cambio de esquema de base de datos.

1. Lee `AGENTS.md`, arquitectura, convenciones de base de datos y despliegue.
2. Inspecciona modelos actuales, migraciones previas y dependencias del cambio.
3. Todo cambio estructural debe quedar versionado mediante Alembic; no reemplaces una migración con cambios manuales.
4. Usa nombres `snake_case`, tablas plurales y nombres explícitos para índices y constraints.
5. Evalúa compatibilidad hacia atrás y riesgo de rollback de aplicación.
6. No asumas que volver a un TAG anterior revierte automáticamente la base de datos.
7. Si hay transformación de datos, diseña una estrategia segura y verificable.
8. Prueba upgrade y, cuando sea razonable, downgrade en ambiente controlado.
9. Documenta impacto, riesgo, orden de despliegue y cualquier paso operativo especial.
10. Valida Definition of Done.

Entrega:
- análisis del cambio;
- migración Alembic;
- impacto en modelos/schemas;
- pruebas realizadas;
- compatibilidad y riesgos;
- instrucciones de despliegue si aplican.
