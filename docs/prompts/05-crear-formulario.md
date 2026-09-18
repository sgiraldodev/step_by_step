# Prompt estándar — Crear formulario

## Prompt

Quiero crear o modificar un formulario en el frontend.

1. Lee `AGENTS.md`, Design System, UX guidelines y arquitectura frontend.
2. Revisa si ya existen formularios, campos, validaciones o patrones reutilizables.
3. Usa `React Hook Form` + `Zod`.
4. Reutiliza componentes de `components/ui` y tokens del Design System.
5. Mantén `snake_case` en contratos API y adapta internamente solo cuando sea necesario.
6. Incluye estados: inicial, loading, success, error, disabled y validación.
7. No dupliques validaciones de negocio que pertenecen al backend; el frontend valida experiencia y formato.
8. Integra con el cliente HTTP centralizado y TanStack Query cuando corresponda.
9. Considera permisos, accesibilidad y responsive behavior.
10. Agrega pruebas de comportamiento relevantes y valida Definition of Done.

Entrega:
- estructura del formulario;
- validaciones;
- estados UX;
- integración API;
- componentes reutilizados/creados;
- pruebas.
