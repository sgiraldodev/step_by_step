# Prompt estándar — Revisar funcionalidad

## Prompt

Quiero auditar una funcionalidad existente antes de considerarla terminada o lista para release.

1. Lee `AGENTS.md`, arquitectura, Design System, seguridad, testing y Definition of Done.
2. Revisa el flujo funcional de punta a punta.
3. Valida que las reglas de negocio estén correctamente implementadas en servicios.
4. Verifica permisos, tenant, errores, transacciones y contratos API.
5. Revisa frontend: estados loading/error/empty, accesibilidad, responsive behavior y reutilización de `components/ui`.
6. Verifica que no existan duplicaciones, accesos entre módulos indebidos, secretos o dependencias innecesarias.
7. Ejecuta pruebas relevantes, lint y cobertura.
8. Revisa documentación, migraciones y ADR si aplican.
9. Clasifica hallazgos por severidad y corrige primero bloqueantes/críticos.
10. Emite un veredicto final contra Definition of Done.

Entrega:
- hallazgos críticos, altos, medios y bajos;
- evidencias/archivos afectados;
- correcciones aplicadas o recomendadas;
- resultado de pruebas;
- estado final de Definition of Done.
