# Estrategia Git

## Rama estable de producción

`release` representa el estado estable y desplegable del proyecto.

Reglas:

- no se permiten pushes directos a `release`;
- los cambios llegan mediante Pull Request;
- CI debe ejecutarse antes de integrar;
- no es obligatoria una aprobación adicional de code review mientras el proyecto sea administrado individualmente y existan las validaciones previas definidas;
- cada despliegue productivo debe estar asociado a un TAG de Git.

## Ramas de trabajo

Usar ramas cortas y enfocadas por cambio:

- `feature/...` para nuevas funcionalidades;
- `fix/...` para correcciones normales;
- `hotfix/...` para correcciones urgentes de producción;
- `chore/...` y `refactor/...` cuando aplique.

Evitar ramas de larga duración.

## Pull Requests

Todo cambio hacia `release` debe entrar por Pull Request. El PR debe explicar qué cambia, por qué cambia, cómo se validó y qué riesgos existen.

## Versionado semántico automático

El proyecto debe mantener una versión explícita con formato:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
1.4.2
```

Interpretación:

- `MAJOR` — primer dígito: cambio funcional o arquitectónico incompatible, cambio de contrato importante o evolución mayor del producto.
- `MINOR` — segundo dígito: nueva funcionalidad, nuevo componente, módulo o capacidad compatible con lo existente.
- `PATCH` — tercer dígito: corrección, ajuste pequeño, bugfix o cambio compatible sin nueva capacidad funcional relevante.

Ejemplos:

```text
1.0.0 → 1.1.0   nueva funcionalidad o componente
1.1.0 → 1.1.1   fix o ajuste menor
1.1.1 → 2.0.0   breaking change o cambio mayor incompatible
```

### Regla de actualización

Cada commit o cambio lógico que modifique comportamiento, funcionalidad o código entregable debe evaluar y actualizar automáticamente la versión del proyecto según el tipo de cambio.

La versión no debe incrementarse arbitrariamente. El agente debe clasificar el cambio y aplicar solo uno de los siguientes incrementos:

```text
breaking / major → MAJOR
feature / component → MINOR
fix / patch → PATCH
```

Cuando se incremente `MAJOR`, reiniciar `MINOR` y `PATCH` a cero.

Cuando se incremente `MINOR`, reiniciar `PATCH` a cero.

Ejemplos:

```text
1.7.4 + feature  → 1.8.0
1.8.0 + fix      → 1.8.1
1.8.1 + breaking → 2.0.0
```

Cambios exclusivamente documentales, comentarios, formato o tareas internas que no alteren el producto pueden no incrementar la versión, salvo que el proyecto decida versionarlos explícitamente.

### Fuente única de versión

Todo proyecto debe mantener una fuente única y legible de versión, preferiblemente un archivo raíz:

```text
VERSION
```

Ejemplo de contenido:

```text
1.8.1
```

Backend, frontend, pipeline y empaquetado deben leer esta versión cuando necesiten exponer o construir artefactos versionados. No mantener números de versión independientes y manuales en múltiples archivos si pueden derivarse de esta fuente única.

### Relación entre commit y versión

Antes de cerrar un cambio relevante o crear su commit final, el agente debe:

1. determinar si el cambio es `major`, `minor` o `patch`;
2. leer la versión actual;
3. calcular la siguiente versión;
4. actualizar la fuente única de versión;
5. incluir ese cambio de versión dentro del mismo commit lógico.

No crear un TAG Git automáticamente por cada commit.

## TAG de producción

El TAG se deriva directamente de la versión aprobada para producción.

Si `VERSION` contiene:

```text
1.8.1
```

el TAG productivo debe ser:

```text
v1.8.1
```

Por tanto, al preparar un release el agente no debe inventar el TAG: debe usar la versión vigente y verificar que el TAG todavía no exista.

Cada despliegue productivo debe utilizar un TAG identificable y trazable.

## Imágenes Docker

Las imágenes productivas deben versionarse utilizando el TAG de Git y, cuando aporte valor, también el SHA del commit.

Los nombres de imágenes y servicios deben seguir la convención documentada en `docs/operations/deployment.md`:

```text
<proyecto>_<servicio>:<version>
```

Ejemplo:

```text
trazenda_backend:v1.8.1
trazenda_frontend:v1.8.1
trazenda_backend:3f82a1c
trazenda_frontend:3f82a1c
```

`latest` no debe ser la referencia principal para un despliegue productivo.

## Rollback

El rollback de aplicación consiste en volver a desplegar un TAG anterior conocido y estable.

Volver a un TAG anterior no implica revertir automáticamente migraciones de base de datos. Las migraciones incompatibles deben evaluarse antes de realizar el rollback.

## Hotfix

Flujo estándar:

```text
release
→ crear hotfix/*
→ implementar corrección
→ incrementar PATCH
→ ejecutar CI mínimo obligatorio
→ Pull Request hacia release
→ crear nuevo TAG desde VERSION
→ aprobación de producción
→ desplegar
```

La urgencia no elimina los requisitos de trazabilidad, versionado ni validaciones mínimas.

## Commits

Preferir commits pequeños, coherentes y con mensajes descriptivos. No mezclar cambios no relacionados.

Antes de cerrar un commit relevante, validar que la versión del proyecto corresponda al tipo de cambio realizado.
