# Prompt estándar — Crear o ampliar tests

## Prompt

Quiero crear, ampliar o reparar la cobertura automatizada de una funcionalidad.

1. Lee `AGENTS.md`, estrategia de pruebas, arquitectura y reglas de negocio relacionadas.
2. Identifica riesgos reales antes de escribir tests por porcentaje.
3. Cubre unitariamente reglas de negocio y funciones aisladas relevantes.
4. Cubre con integración servicios, repositorios, persistencia, permisos y contratos API importantes.
5. Usa E2E para flujos críticos completos cuando aporte valor.
6. Usa `pytest` en backend, `Vitest + Testing Library` en frontend y `Playwright` para E2E.
7. Mantén cobertura global mínima del 80%, sin usarla como único criterio de calidad.
8. Agrega regresiones para bugs corregidos.
9. Evita tests frágiles, dependientes del orden o de servicios externos reales cuando puedan simularse.
10. Documenta fixtures, datos de prueba y decisiones relevantes.

Entrega:
- mapa de riesgos cubiertos;
- tests agregados/modificados;
- cobertura antes/después cuando aplique;
- huecos de prueba restantes;
- resultado de ejecución.
