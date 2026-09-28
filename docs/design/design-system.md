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

Fuente de tokens: `frontend/src/app/globals.css`. Fondo `--background`, superficies `--surface`, `--surface-subtle`, texto `--ink`, `--secondary`, `--muted`, bordes `--border`, acción `--accent`, `--accent-hover`, `--accent-text`, `--accent-soft` y errores `--error-*`. Los valores de ambos temas se conservan desde el producto original. Fuente Arial/Helvetica/sans-serif, sin cursiva; los destacados pueden conservar el color de acento. Iconografía Lucide React. Paneles con radio 20px, botones con radio 10px y tamaño adaptable mediante composición de layout. La cabecera y el contenido autenticado usan un ancho máximo de 1440 px, con márgenes internos de 20 px (32 px desde md); el listado aprovecha el ancho adicional y el reloj conserva 350 px. Cambia a dos columnas en lg; navegación compacta bajo 480px.

Catálogo navegable: `/design-system`, con temas, botones, prioridades, etiquetas y estados.

### Button

Propósito: acciones principales, secundarias y destructivas. Import: `@/components/ui/button`. Props: atributos nativos, `ref`, `variant="primary" | "secondary" | "destructive"`, `size="md" | "sm"`, `loading` y `disabled`. El tamaño `md` conserva la apariencia habitual. `sm` usa la clase oficial `button-compact`: altura mínima de 36 px, padding 6 × 8 px, radio 8 px y texto de 13 px; con puntero táctil aumenta el área mínima a 44 × 44 px. Ejemplo: `<Button size="sm" variant="secondary">Restaurar</Button>`. No reducir padding mediante estilos locales. Default: primary; hover, foco visible, disabled y loading. La variante destructiva usa `--error-bg`, `--error-text` y `--error-border` y se reserva para borrar datos tras una confirmación. Loading deshabilita y expone aria-busy. Conserva la semántica nativa de type: declarar submit para formularios y button para acciones. ClassName admite composición de ancho, espacio y distribución; no redefinir colores ni variantes. Debe tener nombre accesible y texto de progreso cuando corresponda.

```tsx
import {Button} from '@/components/ui/button';
<Button type="submit">Guardar</Button>
<Button type="button" variant="secondary">Cancelar</Button>
<Button type="button" variant="destructive">Sí, borrar</Button>
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

`TaskCreateDialog` se importa desde `@/modules/focus/components/task-create-dialog`.
Es la composición del formulario de tarea: recibe título, prioridad, etiquetas y
sus setters, `create: (event: FormEvent) => Promise<boolean>`, `createTag`, `busy`
y `onClose`. `TaskList` lo monta al pulsar **Nueva tarea**. Reutiliza `Button`,
`TagSelector`, tokens y diálogo nativo: foco inicial en título, Escape/cancelación,
retorno al botón de apertura y desplazamiento vertical en móvil. Conserva el
borrador al cancelar; bloquea cierre y envío durante el guardado y muestra el
error dentro del modal. Se cierra solo tras guardar correctamente.

Los filtros de tareas usan chips con icono, nombre y contador; el activo usa
`--accent`, los demás `--surface-subtle` y `--border`. Permiten navegación con
flechas, Inicio y Fin. Se distribuyen en dos columnas en móvil y cuatro desde
`sm`, con altura mínima de 44 px, padding de 8 px y radio de 8 px. El orden es Pendientes, En progreso, Terminadas y Todas; Pendientes es la selección inicial. Los títulos usan 16–18 px y los metadatos 12 px para priorizar el listado.

`TaskList` usa para **Completar** un botón de icono Check de 17 px, padding de 10 px y radio de 8 px, igual que las acciones contiguas. Lo identifica el fondo `--accent-soft`, borde `--accent-border` y texto `--accent-text`; muestra «Completar tarea sin agregar tiempo ni ciclos» al pasar el cursor y conserva el foco visible. Recibe
`complete: (task: Task) => Promise<void>`. Se oculta en tareas terminadas y se
deshabilita durante una operación, antes de recuperar la sesión del reloj o si
la tarea tiene un temporizador abierto. El nombre accesible incluye el título
de la tarea. En móvil las acciones ocupan una fila propia para conservar la
legibilidad del título. No se añade una variante al catálogo de botones.

Imports bajo `@/modules/focus/components/`; sus contratos tipados son la fuente de props. `TagChip` en tag-selector recibe tag y children opcionales, conserva el texto y aplica el color del catálogo. Ejemplo: `<TagChip tag={{id:'personal',name:'Personal',color:'#7c3aed'}}/>`. `TagSelector` recibe tags, selected, onChange, onCreate y disabled; permite selección múltiple y creación con nombre/color. Cada fila de una etiqueta existente activa su casilla completa, conserva el control accesible para teclado y muestra foco y estado deshabilitado. `TimerSettingsMenu` recibe settings, onSave y disabled, con diálogo nativo, validaciones y confirmación. `TagEditor` recibe target, tags, onCreate, onSave, onClose y busy, también con diálogo nativo. `FocusTimer` recibe active, title, minutes, seconds, busy, onPause, onFinish y onSwitch: el diálogo ocupa la pantalla, responde a Escape y admite pausa.

Se conserva la apariencia y comportamiento de estas composiciones existentes; no recrearlas como variantes locales. Los listados usan prioridades textuales y etiquetas con nombre, evitando depender solo del color. Se mantienen carga, vacío, error y disabled. Las preferencias de movimiento reducido y el foco visible se aplican globalmente.

### Selección múltiple de tareas

`TaskList` sustituye el indicador de estado izquierdo por un `input type="checkbox"`
nativo de 16 px, con `accent-[var(--accent)]`, nombre accesible que incluye el título
y foco visible. El estado continúa escrito en los metadatos de la fila. La casilla
**Seleccionar todas las visibles** soporta estado indeterminado. Las casillas se
deshabilitan durante carga, recuperación del reloj y operaciones de guardado.

`TaskBulkActions`, importado desde `@/modules/focus/components/task-bulk-actions`,
compone la barra contextual con `Button` y `ConfirmDeleteDialog`; no es un componente
base adicional. Recibe `selected: Task[]`, `busy`, `activeTaskId?`, `onAction` asíncrono
(`complete`, `restore`, `delete`) y `onClear`. Usa fondo `--accent-soft`, borde
`--accent-border`, botones primario, secundario y destructivo existentes, y distribuye
las acciones según el ancho real del panel mediante container queries: desde 560 px de espacio interior, contador, acciones y cierre comparten una fila; debajo, contador y cierre van arriba y las tres acciones en columnas iguales debajo. Usa `Button size="sm"`, etiquetas cortas y un icono X con nombre accesible «Cancelar selección». Muestra los motivos de bloqueo.

`TaskList` recibe `selectionScope` (estado y etiqueta) y `onBulkAction`; mantiene la
selección local y la limpia al cambiar de ámbito. Los resultados se anuncian mediante
`role="status"`; los fallos conservan su selección. La confirmación de borrado indica
la cantidad y la pérdida del tiempo registrado. Ejemplo de selección: marcar dos
casillas, comprobar «2 seleccionadas» y pulsar **Completar seleccionadas**.

### Composición de la página de inicio

`LandingPage`, bajo `modules/auth/components`, es una composición de presentación exclusiva del inicio. Enlaza a `/acceso` para iniciar sesión y a `/acceso#registro` para registrarse; no consulta la API ni cambia contratos de autenticación. Usa los tokens globales, enlaces con las clases oficiales `primary` y `secondary-button`, `ThemeToggle` y Lucide; sus estilos de composición viven en `landing-page.module.css`. Los títulos destacados conservan la fuente regular del producto y usan el color de acento, sin cursiva. En móvil las secciones pasan a una columna. Las tarjetas tienen selección con `aria-pressed`, mensajes con `aria-live`, imágenes con descripción accesible y animaciones solo cuando no se solicita movimiento reducido.

El recurso local `frontend/public/images/slow-moments.png` contiene cuatro fotografías que se encuadran mediante CSS. Se generó con la herramienta integrada imagegen usando este prompt: «Cuadrícula de cuatro fotografías editoriales sin texto ni bordes: persona tomando café tranquilamente junto a una ventana, persona disfrutando música con audífonos, manos tocando guitarra acústica y persona leyendo en un sillón. Luz cálida natural, tonos tierra y ambiente tranquilo; cada escena centrada en su cuadrante».

### Composición de validación de correo

`EmailCodeForm`, importado desde `@/modules/auth/components/email-code-form`, es una composición exclusiva de autenticación. Recibe `purpose="registration" | "recovery"`, `initialEmail` y `onVerified(email, token)`. Reutiliza los campos existentes, tokens globales y `Button`; no es un componente base del catálogo. Ejemplo: `<EmailCodeForm purpose="recovery" initialEmail="" onVerified={(email, token) => continuar(email, token)} />`.

El primer paso solicita el correo y el segundo un código de cuatro dígitos, con teclado numérico y autocompletado `one-time-code`. Conserva ceros iniciales. El correo queda de solo lectura tras el envío; **Cambiar correo** inicia otro formulario y **Reenviar código** borra el código anterior del campo. Muestra el tiempo restante desde `expires_at`; cuando vence deshabilita la validación y explica cómo reenviar. El servidor es la autoridad sobre el vencimiento. Los errores usan `role="alert"`, la confirmación usa `role="status"` y el progreso deshabilita las acciones. Los controles se adaptan al ancho del panel, con verificación en 390 y 1280 píxeles.

### Composición de la pantalla de enfoque

`OfficeGif` es una composición exclusiva del diálogo de fin de enfoque, sin props. Muestra un GIF local aleatorio de The Office por apertura, con texto alternativo y control de pausa mediante `Button` secundario. Utiliza `--border`, `--surface-subtle` y `--muted`; comienza con imagen estática si se solicita movimiento reducido y comunica errores de carga. El medio conserva su proporción dentro del ancho disponible y el diálogo permite desplazamiento vertical.

El título de tarea utiliza fondo `--surface` y borde `--border` sobre el contenedor `--surface-subtle`. Agregar se ubica debajo de las etiquetas y ocupa el ancho disponible. `TagSelector` conserva la selección múltiple mientras está abierto y se cierra con clic exterior, salida de foco o Escape. El diálogo de fin de enfoque ofrece continuar la misma tarea, terminarla o cambiar de tarea; todas las opciones registran el ciclo completado.

`TaskList` y `TimerPanel` reutilizan los tokens y componentes del catálogo. Reciben datos y callbacks explícitos; la pantalla coordina acciones mediante los hooks `useFocusData` y `useTimerSession`. No incorporan acceso directo a la API.
