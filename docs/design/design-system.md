# Design System

## Objetivo

Definir la fuente única de verdad visual del producto para evitar inconsistencias entre módulos y desarrollos futuros.

El Design System no debe limitarse a describir cómo se ve un componente. También debe indicar de forma práctica cómo se implementa, cómo se invoca y qué variantes están permitidas para que cualquier desarrollador pueda reutilizarlo correctamente sin inventar clases o estilos nuevos.

## Principios

- reutilizar antes de crear;
- consistencia sobre preferencias locales;
- accesibilidad desde el diseño;
- responsive behavior obligatorio;
- estados completos para cada componente;
- cambios globales mediante tokens y componentes compartidos;
- documentación práctica orientada a implementación;
- ejemplos de uso obligatorios para componentes reutilizables.

## Fundamentos

Documentar por proyecto:

- paleta de colores;
- tipografía;
- escalas de tamaño;
- spacing;
- grid y layout;
- bordes y radios;
- sombras;
- iconografía;
- motion y transiciones.

Cada fundamento debe identificar, cuando aplique, el token o clase oficial que debe utilizarse. No deben documentarse únicamente valores visuales aislados si existe un token reutilizable.

Ejemplo conceptual:

```text
Color primario
Token: --color-primary
Tailwind/token equivalente: bg-primary / text-primary
Uso: CTA principal, enlaces activos y estados seleccionados definidos por el proyecto.
```

## Componentes mínimos

Cuando apliquen al producto, definir:

- botones;
- inputs;
- selects;
- textareas;
- checkboxes y radios;
- tablas;
- tabs;
- cards;
- badges;
- modales;
- drawers;
- tooltips;
- alertas;
- navegación;
- paginación;
- filtros;
- loaders;
- empty states.

## Ficha obligatoria por componente

Cada componente reutilizable del Design System debe documentarse con una ficha técnica suficientemente clara para que otro desarrollador pueda implementarlo sin revisar internamente su código.

La ficha debe incluir, cuando aplique:

1. **Nombre del componente.**
2. **Propósito:** cuándo debe utilizarse.
3. **Import oficial:** ruta desde la cual debe importarse.
4. **API pública:** props principales y valores admitidos.
5. **Variantes:** `primary`, `secondary`, `destructive`, tamaños u otras variantes autorizadas.
6. **Tokens o clases oficiales:** clases Tailwind, variables CSS o utilidades aprobadas que formen parte de su implementación pública.
7. **Estados soportados:** default, hover, focus, disabled, loading, error, etc.
8. **Ejemplo mínimo de uso.**
9. **Ejemplos de variantes comunes.**
10. **Uso incorrecto o anti-patrones**, cuando exista riesgo frecuente de uso inconsistente.
11. **Consideraciones de accesibilidad.**
12. **Notas responsive**, cuando correspondan.

## Ejemplos de implementación obligatorios

Para cada componente reutilizable deben existir ejemplos de código copiables y funcionales.

### Ejemplo: Button

```tsx
import { Button } from "@/components/ui/button";

export function SaveCustomerButton() {
  return (
    <Button variant="primary" size="md">
      Guardar cliente
    </Button>
  );
}
```

Variantes documentadas:

```tsx
<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="primary" loading>Guardando...</Button>
<Button variant="primary" disabled>Guardar</Button>
```

No debe ser necesario que un desarrollador escriba clases visuales distintas para recrear una variante ya soportada por el componente.

Ejemplo a evitar:

```tsx
<button className="bg-blue-600 rounded-lg px-4 py-2 text-white">
  Guardar
</button>
```

si el Design System ya dispone de `Button` para ese propósito.

### Ejemplo: Modal

```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function DeleteCustomerModal() {
  return (
    <Modal open={true}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Eliminar cliente</ModalTitle>
        </ModalHeader>

        <p>Esta acción requiere confirmación.</p>

        <ModalFooter>
          <Button variant="secondary">Cancelar</Button>
          <Button variant="destructive">Eliminar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

El ejemplo concreto de cada proyecto debe usar los nombres reales de componentes, props y rutas de importación existentes en el código. Los ejemplos anteriores son únicamente el formato de documentación esperado para el starter.

## Clases y estilos

Cuando un componente exponga clases, tokens o utilidades de estilo como parte de su contrato público, deben documentarse explícitamente.

Sin embargo, la preferencia es encapsular la apariencia dentro de `components/ui` y exponer una API semántica mediante props como `variant`, `size`, `state` o equivalentes.

Preferido:

```tsx
<Button variant="primary" size="sm" />
```

En lugar de:

```tsx
<Button className="h-8 bg-primary px-3 text-sm ..." />
```

Las clases arbitrarias sobre componentes del Design System solo deben utilizarse cuando el componente permita explícitamente esa extensión y no rompa la consistencia visual.

## Página viva del Design System

Cada proyecto debe mantener una vista navegable del Design System o catálogo de componentes donde sea posible inspeccionar visualmente:

- todos los componentes base;
- variantes;
- tamaños;
- estados;
- combinaciones comunes;
- ejemplos de formularios;
- ejemplos de tablas;
- modales y drawers;
- feedback y notificaciones;
- responsive behavior cuando sea relevante.

Esta página debe funcionar como referencia visual para desarrollo y QA, además de la documentación escrita.

## Estados

Cada componente debe contemplar según corresponda:

- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- error;
- success;
- permiso insuficiente.

Los ejemplos de documentación deben mostrar los estados relevantes cuando no sean obvios.

## Regla de gobierno

No crear un nuevo componente si ya existe uno equivalente. Si una necesidad no está cubierta, primero evaluar extender el componente existente y actualizar este documento.

Cuando se cree o modifique un componente reutilizable, la tarea no se considera completa hasta actualizar también:

- su ficha técnica;
- sus ejemplos de uso;
- sus variantes y estados;
- la página viva del Design System cuando aplique.

La documentación debe reflejar la implementación real. No deben mantenerse ejemplos obsoletos ni props que ya no existan.
