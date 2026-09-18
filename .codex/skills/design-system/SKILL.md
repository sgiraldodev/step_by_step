---
name: design-system
description: Aplicar, implementar, extender o auditar el Design System del proyecto. Usar cuando una tarea afecte componentes UI, tokens, estilos, formularios, tablas, modales, navegación, responsive, accesibilidad, estados visuales o el catálogo vivo de componentes.
---

# Design System

## Propósito

Garantizar que cualquier interfaz nueva o modificada respete la fuente única de verdad visual del proyecto y reutilice los componentes existentes antes de crear variantes nuevas.

Esta Skill aporta un procedimiento de trabajo. Las decisiones visuales concretas viven en la documentación y el código del proyecto.

## Antes de actuar

Lee obligatoriamente:

- `AGENTS.md`;
- `docs/design/design-system.md`;
- `docs/design/ux-guidelines.md`;
- `docs/development/definition-of-done.md`;
- documentación funcional de la pantalla o flujo afectado.

Luego inspecciona:

- `components/ui` o la biblioteca compartida equivalente;
- tokens CSS/TypeScript/Tailwind existentes;
- componentes de producto reutilizables;
- catálogo o página viva del Design System;
- implementaciones similares en otros módulos.

## Orden obligatorio

Antes de crear cualquier componente o estilo:

```text
reutilizar
→ extender
→ crear nuevo
```

No crees una variante local de un componente existente solo para resolver diferencias menores de color, tamaño, spacing o comportamiento.

## Método

1. Identifica el patrón visual y funcional requerido.
2. Busca un componente o composición equivalente existente.
3. Verifica su API pública, variantes, estados y ejemplos documentados.
4. Reutilízalo sin sobrescribir estilos arbitrariamente cuando el contrato existente sea suficiente.
5. Si falta una capacidad repetible, evalúa extender el componente compartido.
6. Crea un componente nuevo solo si representa una responsabilidad visual o interactiva distinta.
7. Mantén sincronizados componente, documentación, catálogo y pruebas.

## API de componentes

Prefiere APIs semánticas:

```tsx
<Button variant="primary" size="md" />
```

sobre personalizaciones locales como:

```tsx
<Button className="bg-blue-600 px-4 h-11 ..." />
```

Las clases arbitrarias no deben sustituir variantes que deberían formar parte del contrato del componente.

## Ficha técnica obligatoria

Cuando se cree o modifique un componente reutilizable, documenta cuando aplique:

- propósito;
- import oficial;
- API pública y props;
- variantes y tamaños;
- tokens o clases públicas;
- estados;
- ejemplo mínimo copiable;
- variantes comunes;
- anti-patrones;
- accesibilidad;
- comportamiento responsive.

Los ejemplos deben coincidir con la implementación real. No documentes props, rutas o variantes inexistentes como si fueran ejecutables.

## Estados

Valida según corresponda:

- default;
- hover;
- focus visible;
- active;
- disabled;
- loading;
- error;
- success;
- empty;
- permiso insuficiente.

## Formularios

Los formularios deben reutilizar campos, labels, ayudas, mensajes de error y patrones de validación existentes. El frontend no debe redefinir reglas de negocio que pertenecen al backend.

## Tablas y listados

Para tablas, valida:

- densidad y alturas definidas;
- paginación;
- filtros;
- ordenamiento;
- loading;
- empty state;
- error;
- acciones por permisos;
- comportamiento responsive sin scroll horizontal de página.

## Modales y acciones destructivas

Los modales deben usarse para decisiones o contextos que realmente requieren interrupción. Las acciones destructivas deben distinguirse visualmente y requerir el patrón de confirmación definido por UX.

La UI nunca convierte una operación destructiva en autorizada: siguen aplicando las restricciones de `AGENTS.md`.

## Accesibilidad

Comprueba como mínimo cuando aplique:

- navegación por teclado;
- foco visible;
- nombres accesibles;
- contraste;
- semántica HTML;
- áreas táctiles adecuadas;
- zoom/texto al 200%;
- `prefers-reduced-motion`;
- no comunicar significado únicamente mediante color.

## Responsive

Usa los breakpoints y puntos de verificación establecidos por el Design System. Diseña por comportamiento del contenido, no duplicando una interfaz separada para cada dispositivo.

## Catálogo vivo

Cuando el proyecto disponga de catálogo navegable, todo componente reutilizable nuevo o modificado debe reflejar allí:

- variantes;
- tamaños;
- estados;
- ejemplos relevantes.

## Resultado esperado

La funcionalidad debe parecer parte natural del mismo producto, usar la API pública del Design System y no introducir estilos o componentes paralelos innecesarios.
