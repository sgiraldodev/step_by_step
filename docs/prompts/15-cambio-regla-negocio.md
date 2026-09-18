# Prompt estándar — Cambio de regla de negocio

## Prompt

Quiero modificar una regla de negocio importante existente.

1. Lee `AGENTS.md`, requisitos, documentación funcional, arquitectura y Definition of Done.
2. Identifica la regla actual, dónde está implementada y qué módulos/procesos dependen de ella.
3. Explica claramente comportamiento actual vs comportamiento nuevo antes de cambiar código.
4. Evalúa impacto en datos existentes, estados, permisos, integraciones, reportes, API y frontend.
5. Implementa la regla en `service.py` o en la capa de negocio correspondiente; no la disperses entre UI, routers o repositorios.
6. Si el cambio es relevante, transversal, difícil de revertir o afecta comportamiento central, crea/actualiza un ADR que documente contexto, decisión, consecuencias y fecha.
7. Define estrategia de migración de datos si la regla nueva invalida o transforma información existente.
8. Agrega pruebas unitarias e integración para escenarios nuevos, anteriores y límites.
9. Actualiza documentación funcional, changelog cuando corresponda y cualquier texto UI afectado.
10. Valida Definition of Done.

Entrega:
- regla anterior;
- nueva regla;
- impacto por módulo;
- ADR si aplica;
- implementación;
- migraciones de datos si aplican;
- pruebas;
- documentación actualizada.
