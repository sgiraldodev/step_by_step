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

## Implementación real de Pomodoro

Fuente de tokens: `frontend/src/app/globals.css`. Fondo `--background`, superficies `--surface`, `--surface-subtle`, texto `--ink`, `--secondary`, `--muted`, bordes `--border`, acción `--accent`, `--accent-hover`, `--accent-text`, `--accent-soft` y errores `--error-*`. Los valores de ambos temas se conservan desde el producto original. Fuente Arial/Helvetica/sans-serif; iconografía Lucide React. Paneles con radio 20px, botones con radio 10px y tamaño adaptable mediante composición de layout. El contenido usa max-w-6xl y cambia a dos columnas en lg; navegación compacta bajo 480px.

Catálogo navegable: `/design-system`, con temas, botones, prioridades, etiquetas y estados.

### Button

Propósito: acciones principales y secundarias. Import: `@/components/ui/button`. Props: atributos nativos, `ref`, `variant="primary" | "secondary"`, `loading` y `disabled`. Default: primary; hover, foco visible, disabled y loading. Loading deshabilita y expone aria-busy. Conserva la semántica nativa de type: declarar submit para formularios y button para acciones. ClassName admite composición de ancho, espacio y distribución; no redefinir colores ni variantes. Debe tener nombre accesible y texto de progreso cuando corresponda.

```tsx
import {Button} from '@/components/ui/button';
<Button type="submit">Guardar</Button>
<Button type="button" variant="secondary">Cancelar</Button>
<Button loading>Guardando…</Button>
<Button disabled>Iniciar</Button>
```

### ThemeToggle

Import: `@/components/ui/theme-toggle`. Sin props. Alterna temas mediante dataset.theme y conserva la preferencia `step-theme`. Incluye nombre accesible; se puede operar con teclado. Ejemplo: `<ThemeToggle/>`.

### ColorPicker

Propósito: personalizar el color de la aplicación desde Configuración. Import: `@/components/ui/color-picker`. Sin props; ejemplo: `<ColorPicker />`. Disponible también en `/design-system`.

Ofrece diez opciones: azul (original), verde, turquesa, celeste, naranja, rosado, lila, violeta, rojo y gris. Cada opción tiene nombre y muestra visual; los radios nativos permiten selección con teclado y muestran foco y selección. El cambio es inmediato e independiente del guardado de los tiempos del temporizador. No se asignan colores por edad o género.

En el espacio autenticado, la preferencia se guarda en el perfil mediante `PATCH /api/v1/auth/preferences` y se restaura desde `app_color` al entrar. Cada usuario empieza en azul y conserva su elección al cerrar sesión, recargar o cambiar de navegador. No se adopta automáticamente el color local de otra cuenta. Mientras se guarda se deshabilita la selección; si falla, se recupera el color anterior y se comunica el error. Al salir se aplica azul a la pantalla pública. El modo claro/oscuro se conserva por separado. El catálogo sin sesión conserva su selección local en `step-color`, independiente de los perfiles.

Las paletas viven en `globals.css` mediante `--palette-accent` y `--palette-highlight`; actualizan `--accent`, `--accent-hover`, `--accent-text`, `--accent-soft`, `--accent-border` y `--background`. Los botones mantienen texto blanco y el modo oscuro usa texto de acento más claro. Las prioridades, etiquetas y errores conservan su significado visual. La cuadrícula adapta sus columnas y Configuración permite desplazamiento vertical en pantallas pequeñas. `ColorPreferenceProvider` se importa desde `@/components/ui/color-preference-provider`, recibe `initialColor`, `onSave` asíncrono y `children`, y se monta con la identidad de la cuenta como key. Proporciona a `ColorPicker` selección, progreso y mensaje; evita que respuestas pendientes cambien el color después de salir.

### Componentes del dominio focus

Imports bajo `@/modules/focus/components/`; sus contratos tipados son la fuente de props. `TagChip` en tag-selector recibe tag y children opcionales, conserva el texto y aplica el color del catálogo. Ejemplo: `<TagChip tag={{id:'personal',name:'Personal',color:'#7c3aed'}}/>`. `TagSelector` recibe tags, selected, onChange, onCreate y disabled; permite selección múltiple y creación con nombre/color. `TimerSettingsMenu` recibe settings, onSave y disabled, con diálogo nativo, validaciones y confirmación. `TagEditor` recibe target, tags, onCreate, onSave, onClose y busy, también con diálogo nativo. `FocusTimer` recibe active, title, minutes, seconds, busy, onPause, onFinish y onSwitch: el diálogo ocupa la pantalla, responde a Escape y admite pausa.

Se conserva la apariencia y comportamiento de estas composiciones existentes; no recrearlas como variantes locales. Los listados usan prioridades textuales y etiquetas con nombre, evitando depender solo del color. Se mantienen carga, vacío, error y disabled. Las preferencias de movimiento reducido y el foco visible se aplican globalmente.

### Composición de la página de inicio

`LandingPage`, bajo `modules/auth/components`, es una composición de presentación exclusiva del inicio. Enlaza a `/acceso` para iniciar sesión y a `/acceso#registro` para registrarse; no consulta la API ni cambia contratos de autenticación. Usa los tokens globales, enlaces con las clases oficiales `primary` y `secondary-button`, `ThemeToggle` y Lucide; sus estilos de composición viven en `landing-page.module.css`. Los títulos destacados usan Georgia como acento editorial local. En móvil las secciones pasan a una columna. Las tarjetas tienen selección con `aria-pressed`, mensajes con `aria-live`, imágenes con descripción accesible y animaciones solo cuando no se solicita movimiento reducido.

El recurso local `frontend/public/images/slow-moments.png` contiene cuatro fotografías que se encuadran mediante CSS. Se generó con la herramienta integrada imagegen usando este prompt: «Cuadrícula de cuatro fotografías editoriales sin texto ni bordes: persona tomando café tranquilamente junto a una ventana, persona disfrutando música con audífonos, manos tocando guitarra acústica y persona leyendo en un sillón. Luz cálida natural, tonos tierra y ambiente tranquilo; cada escena centrada en su cuadrante».

### Composición de la pantalla de enfoque

`OfficeGif` es una composición exclusiva del diálogo de fin de enfoque, sin props. Muestra un GIF local aleatorio de The Office por apertura, con texto alternativo y control de pausa mediante `Button` secundario. Utiliza `--border`, `--surface-subtle` y `--muted`; comienza con imagen estática si se solicita movimiento reducido y comunica errores de carga. El medio conserva su proporción dentro del ancho disponible y el diálogo permite desplazamiento vertical.

El título de tarea utiliza fondo `--surface` y borde `--border` sobre el contenedor `--surface-subtle`. Agregar se ubica debajo de las etiquetas y ocupa el ancho disponible. `TagSelector` conserva la selección múltiple mientras está abierto y se cierra con clic exterior, salida de foco o Escape. El diálogo de fin de enfoque ofrece continuar la misma tarea, terminarla o cambiar de tarea; todas las opciones registran el ciclo completado.

`TaskList` y `TimerPanel` reutilizan los tokens y componentes del catálogo. Reciben datos y callbacks explícitos; la pantalla coordina acciones mediante los hooks `useFocusData` y `useTimerSession`. No incorporan acceso directo a la API.
