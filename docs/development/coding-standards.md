# Estándares de código

## Objetivo

Definir reglas obligatorias de mantenibilidad, legibilidad, separación de responsabilidades y calidad estructural para evitar código difícil de evolucionar, dependencias innecesarias y acumulación de deuda técnica.

Estas reglas complementan la arquitectura, la estrategia de testing y la Definition of Done. No sustituyen decisiones específicas documentadas mediante ADR.

## Principios generales

Todo desarrollo debe priorizar:

- claridad antes que complejidad;
- alta cohesión y bajo acoplamiento;
- funciones, clases y módulos con responsabilidades explícitas;
- composición sobre acoplamiento rígido o herencia innecesaria;
- dependencias explícitas;
- reglas de negocio fuera de transporte, UI y persistencia;
- validación de entradas en los límites del sistema;
- código fácil de probar, leer, modificar y eliminar;
- soluciones simples antes que abstracciones prematuras.

## Principios SOLID

Aplicar SOLID cuando contribuya a una solución más clara y mantenible. No convertir SOLID en una excusa para crear capas, interfaces o abstracciones sin necesidad real.

### Single Responsibility Principle

Una unidad de código debe tener una responsabilidad principal claramente identificable.

Evitar:

- services que mezclen negocio, persistencia, serialización, logging y llamadas externas;
- componentes React que resuelvan simultáneamente layout, fetching, validación, reglas de negocio y estado complejo;
- clases o archivos que se conviertan en puntos centrales para funcionalidades no relacionadas.

### Open/Closed Principle

Preferir estructuras que permitan extender comportamiento sin modificar continuamente lógica central estable.

No crear sistemas de plugins, factories o jerarquías complejas cuando solo exista un caso real.

### Liskov Substitution Principle

Las implementaciones que sustituyan una abstracción deben respetar su contrato y no introducir comportamiento inesperado.

### Interface Segregation Principle

Preferir contratos pequeños y enfocados. No obligar a módulos o consumidores a depender de métodos o datos que no necesitan.

### Dependency Inversion Principle

La lógica de negocio no debe depender directamente de detalles concretos de infraestructura cuando exista una frontera clara que convenga abstraer, especialmente para integraciones externas.

Las abstracciones deben responder a una necesidad real, no a anticipar escenarios hipotéticos.

## KISS, DRY y YAGNI

### KISS

La solución correcta más simple tiene prioridad sobre una solución más sofisticada con el mismo resultado.

Evitar:

- patrones introducidos solo por moda;
- capas sin responsabilidad propia;
- helpers o wrappers que no reduzcan complejidad real;
- configuraciones dinámicas cuando una solución explícita sea más clara.

### DRY

Evitar duplicación relevante de reglas, contratos o conocimiento de negocio.

No aplicar DRY de forma mecánica. Dos fragmentos parecidos no justifican una abstracción si evolucionan por razones diferentes.

### YAGNI

No implementar capacidades, configuraciones, endpoints, abstracciones o extensiones que no estén respaldadas por una necesidad actual aprobada.

## Prohibición de código spaghetti

No se acepta código cuya comprensión dependa de seguir múltiples efectos laterales, dependencias implícitas o saltos entre capas sin un flujo claro.

Se consideran señales de código spaghetti:

- lógica de negocio distribuida entre router, repository, UI y helpers sin un responsable claro;
- acceso directo entre módulos saltándose servicios públicos;
- dependencias circulares;
- funciones que modifican estado global o múltiples recursos de forma implícita;
- cadenas de callbacks, efectos o condiciones difíciles de seguir;
- consultas de persistencia mezcladas con validación HTTP o presentación;
- componentes frontend que realizan fetching, negocio, transformación, navegación y render complejo en un único bloque.

Cuando aparezca alguna de estas señales, refactoriza antes de ampliar el comportamiento.

## Tamaño y responsabilidad

No existe un límite rígido universal de líneas, pero el tamaño debe considerarse una señal de diseño.

Revisar y dividir cuando:

- una función tenga varias razones independientes para cambiar;
- una función requiera desplazarse extensamente para comprender su flujo;
- una clase o service acumule casos de uso no relacionados;
- un archivo combine múltiples responsabilidades de dominio o infraestructura;
- un componente React contenga demasiada lógica no visual;
- el número de parámetros dificulte comprender o usar correctamente una función.

Antes de crear una nueva abstracción, confirma que la división mejora responsabilidades y no solo mueve complejidad de lugar.

## Complejidad de control

Evitar condicionales profundamente anidados.

Preferir cuando mejore claridad:

- validaciones tempranas;
- early returns;
- funciones especializadas;
- estrategias o tablas de decisión cuando existan múltiples comportamientos reales;
- extracción de reglas de negocio con nombres explícitos.

Una cadena extensa de `if/elif/else`, `switch` o ternarios anidados debe revisarse si representa estados o reglas que merecen un modelo más claro.

No ocultar lógica compleja detrás de expresiones compactas difíciles de leer.

## Nombres y legibilidad

- usar nombres descriptivos que expresen intención;
- evitar abreviaturas ambiguas;
- evitar nombres genéricos como `data`, `item`, `obj`, `temp`, `manager` o `helper` cuando exista un nombre de dominio más preciso;
- usar nombres consistentes con el glosario y el lenguaje del negocio;
- las funciones deben describir acciones o consultas;
- las clases, tipos y entidades deben representar conceptos claros;
- evitar números, strings y estados mágicos: usar constantes, enums o configuración cuando corresponda.

Los comentarios deben explicar decisiones, restricciones o contexto no evidente. No usar comentarios para compensar código confuso que puede expresarse mejor mediante nombres y estructura.

## Manejo de errores

- no silenciar errores;
- no usar `except Exception` o `catch` genérico para ocultar fallos sin una razón y trazabilidad explícitas;
- traducir errores en la capa adecuada;
- preservar causa técnica para logs y observabilidad sin exponer datos sensibles al usuario;
- no utilizar excepciones como flujo normal de negocio cuando un resultado explícito sea más adecuado;
- mantener códigos de error estables cuando formen parte del contrato público.

## Estado y efectos laterales

- minimizar estado mutable compartido;
- hacer explícitas las operaciones con efectos laterales;
- no modificar datos persistidos desde funciones que aparenten ser consultas;
- mantener las transacciones visibles en la capa responsable;
- no depender de orden de ejecución implícito entre componentes o módulos;
- favorecer funciones puras para cálculos y transformaciones cuando sea práctico.

## Backend

Para Python/FastAPI aplicar además la arquitectura vigente.

Regla base cuando el proyecto no defina otra cosa:

```text
router → service → repository → persistence
```

### Router

- solo transporte HTTP, dependencias y serialización;
- no contiene reglas de negocio;
- no ejecuta SQL ni accede directamente a modelos de persistencia;
- no coordina transacciones complejas.

### Service

- contiene casos de uso y reglas de aplicación;
- coordina repositories y servicios públicos de otros módulos;
- controla la transacción cuando corresponda;
- no depende de `HTTPException` como mecanismo de dominio;
- evita convertirse en God Service: divide por caso de uso o responsabilidad cuando sea necesario.

### Repository

- solo persistencia;
- no contiene decisiones de negocio;
- no hace `commit()` automáticamente;
- no expone detalles innecesarios de SQLAlchemy a capas superiores.

### Modelos y schemas

- modelos SQLAlchemy separados de schemas Pydantic;
- schemas separados por intención cuando creación, actualización y lectura tengan contratos distintos;
- no reutilizar una misma estructura solo para ahorrar archivos si mezcla responsabilidades.

### Comunicación entre módulos

- un módulo consume otro mediante su API o service público;
- no acceder directamente al repository, tablas o modelos internos de otro módulo salvo excepción arquitectónica documentada;
- evitar dependencias circulares;
- dependencias compartidas realmente transversales viven en `core`, no en un módulo de negocio arbitrario.

## Frontend

Para Next.js/React/TypeScript aplicar el Design System y la arquitectura frontend vigente.

- separar fetching, estado remoto y presentación cuando la complejidad lo justifique;
- usar el cliente HTTP centralizado, no `fetch` disperso en componentes;
- evitar duplicar reglas de negocio que pertenecen al backend;
- evitar estado global cuando el estado sea local o remoto;
- preferir componentes pequeños con responsabilidad visual clara;
- extraer hooks cuando encapsulen comportamiento reutilizable real;
- evitar hooks gigantes que se conviertan en services ocultos;
- no crear variantes visuales mediante clases arbitrarias si existe un componente o token del Design System;
- manejar estados de carga, vacío, error, permisos y disabled de forma explícita.

## Dependencias

Antes de agregar una dependencia:

1. comprobar si el proyecto ya resuelve esa necesidad;
2. comprobar si el stack estándar incluye una alternativa;
3. evaluar mantenimiento, seguridad, tamaño e impacto operativo;
4. evitar dependencias para funcionalidades triviales que puedan implementarse claramente con el lenguaje o framework;
5. documentar una dependencia significativa cuando cambie arquitectura u operación.

## Code smells que deben corregirse

No introducir ni ampliar deliberadamente:

- God Classes o God Services;
- funciones gigantes con múltiples responsabilidades;
- archivos monolíticos sin una razón clara;
- lógica de negocio duplicada;
- copy/paste de reglas que deberían tener una fuente única;
- dependencias circulares;
- acceso directo a repositories de otros módulos;
- SQL en routers o componentes de UI;
- `fetch` disperso en componentes;
- estado global innecesario;
- constantes mágicas;
- booleanos o parámetros cuyo significado no sea evidente;
- condicionales profundamente anidados;
- `catch` o `except` que oculten errores;
- comentarios que expliquen código innecesariamente complejo en lugar de refactorizarlo;
- helpers genéricos que acumulen responsabilidades no relacionadas;
- clases `Manager`, `Utils`, `Common` o equivalentes usadas como cajón de sastre.

## Refactorización

Refactorizar cuando sea necesario para implementar correctamente una tarea, pero mantener el alcance controlado.

- no realizar refactors masivos no relacionados sin aprobación;
- si una mala estructura existente impide implementar de forma segura, señalarlo y proponer el refactor mínimo necesario;
- preservar comportamiento mediante pruebas antes y después cuando sea posible;
- no mezclar un rediseño arquitectónico amplio con un fix pequeño sin justificarlo.

## Testing como parte del diseño

El código debe ser testeable por construcción.

Si una unidad resulta difícil de probar por exceso de dependencias, estado global o efectos implícitos, tratarlo como señal de diseño deficiente antes de recurrir a mocks excesivos.

Las pruebas deben cubrir comportamiento y reglas relevantes, no detalles internos sin valor.

## Criterio obligatorio antes de cerrar una tarea

Antes de considerar un cambio terminado, revisar explícitamente:

- ¿introduce código spaghetti?
- ¿mezcla responsabilidades que deberían estar separadas?
- ¿viola de forma clara algún principio SOLID?
- ¿duplica una regla o conocimiento que debería tener una única fuente?
- ¿introduce acoplamiento innecesario entre módulos?
- ¿añade complejidad que no requiere la necesidad actual?
- ¿existe una función, clase, service, hook o componente excesivamente grande?
- ¿las dependencias y efectos laterales son comprensibles y explícitos?
- ¿el cambio sigue siendo fácil de probar y mantener?

Si alguna respuesta representa un problema material, corregirlo antes de marcar la tarea como completada.
