# Prompt estándar — Hotfix de producción

## Prompt

Quiero corregir urgentemente un problema en producción.

1. Lee `AGENTS.md`, estrategia Git, testing, despliegue y Definition of Done.
2. Parte desde `release` creando `hotfix/*`.
3. Reproduce y documenta el problema y su impacto.
4. Aplica la corrección mínima segura; evita cambios no relacionados.
5. Agrega prueba de regresión cuando sea viable.
6. Ejecuta CI mínimo obligatorio: lint, tests relevantes y validaciones críticas.
7. Integra mediante PR hacia `release`.
8. Genera un nuevo TAG siguiendo Semantic Versioning.
9. Actualiza changelog con el incidente y la corrección.
10. Despliega de forma controlada y valida salud, logs, métricas y flujo afectado.
11. Si se requiere restaurar datos, no ejecutes restauración automáticamente: requiere autorización explícita del responsable.

Entrega:
- causa e impacto;
- corrección aplicada;
- pruebas;
- TAG propuesto;
- changelog;
- validación posterior al despliegue;
- riesgos restantes.
