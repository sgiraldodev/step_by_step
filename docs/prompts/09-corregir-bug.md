# Prompt estándar — Corregir bug

## Prompt

Quiero diagnosticar y corregir un bug existente.

1. Lee `AGENTS.md`, arquitectura, reglas de negocio, testing y Definition of Done.
2. Reproduce el problema antes de modificar código cuando sea posible.
3. Identifica causa raíz y evita parches superficiales que oculten el defecto.
4. Revisa impacto en otros módulos, contratos API, permisos, tenant, transacciones y UI.
5. Mantén el cambio lo más pequeño y seguro posible.
6. Agrega una prueba de regresión que falle antes de la corrección y pase después, cuando sea viable.
7. No aproveches el bugfix para refactorizaciones no relacionadas salvo que sean necesarias para resolver correctamente la causa.
8. Actualiza documentación si el comportamiento esperado estaba ambiguo o cambia.
9. Si el bug proviene de una regla de negocio relevante mal definida, documenta la decisión mediante ADR cuando aplique.
10. Valida todas las pruebas afectadas y Definition of Done.

Entrega:
- síntoma reproducido;
- causa raíz;
- solución aplicada;
- prueba de regresión;
- impacto y riesgos;
- archivos modificados.
