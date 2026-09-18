# Prompt estándar — Refactorizar

## Prompt

Quiero refactorizar una parte existente de la aplicación sin cambiar su comportamiento esperado.

1. Lee `AGENTS.md`, arquitectura, testing y Definition of Done.
2. Identifica claramente qué problema técnico se quiere resolver: duplicación, acoplamiento, complejidad, nombres, estructura, rendimiento mantenible u otro.
3. Define el comportamiento que debe permanecer intacto antes de modificar código.
4. Revisa y fortalece las pruebas existentes si no protegen suficientemente ese comportamiento.
5. Mantén los límites de módulos y capas; no muevas reglas de negocio a capas incorrectas.
6. Evita introducir nuevas dependencias salvo beneficio claro.
7. Haz cambios pequeños y verificables cuando sea posible.
8. No mezcles nuevas funcionalidades con la refactorización.
9. Si la refactorización cambia una decisión arquitectónica relevante, crea o actualiza un ADR.
10. Ejecuta pruebas, lint, cobertura y valida Definition of Done.

Entrega:
- problema técnico identificado;
- comportamiento preservado;
- cambios realizados;
- pruebas ejecutadas;
- mejora conseguida;
- riesgos o deuda restante.
