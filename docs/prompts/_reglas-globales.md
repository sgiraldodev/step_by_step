# Reglas globales para prompts

## Objetivo

Centralizar el comportamiento común que deben seguir todos los prompts de `docs/prompts/` para evitar duplicación, contradicciones y mantenimiento disperso.

Todos los prompts de esta carpeta heredan estas reglas y `AGENTS.md`. `PROJECT_CONTEXT.md` determina qué partes de arquitectura, producto, Design System, testing, operaciones y Definition of Done son aplicables; no deben cargarse todas por defecto.

## Flujo de trabajo

1. Leer `AGENTS.md`, enrutar con `PROJECT_CONTEXT.md` y cargar únicamente la documentación relevante para la tarea.
2. Inspeccionar la implementación existente antes de proponer cambios, priorizando archivos, módulos y contratos afectados sobre una lectura completa del repositorio.
3. Buscar soluciones equivalentes y aplicar esta prioridad:
   - reutilizar;
   - extender;
   - crear nuevo solo cuando lo anterior no sea adecuado.
4. Traducir la solicitud en criterios de aceptación verificables.
5. Presentar una propuesta breve y ejecutiva antes de modificar código.
6. Esperar una única aprobación del usuario.
7. Después de aprobar, ejecutar de punta a punta sin pedir confirmaciones intermedias, salvo excepciones indicadas en este documento.
8. Ejecutar validaciones y pruebas aplicables con alcance incremental.
9. Actualizar la documentación afectada.
10. Verificar la Definition of Done con el nivel de validación correspondiente al cambio.

## Modos de ejecución

Toda tarea debe operar con uno de estos niveles. Si el usuario no indica uno, el agente debe elegir el menor nivel suficiente según alcance y riesgo.

### LIGHT

Para cambios locales y de bajo riesgo, por ejemplo ajustes visuales, textos, validaciones pequeñas o bugs aislados.

- leer solo contexto directamente afectado;
- inspeccionar solo módulos y archivos relacionados;
- ejecutar lint o tests específicos del cambio;
- no ejecutar suite completa salvo evidencia de impacto transversal;
- no reconstruir Docker si no cambió la capa o dependencia correspondiente.

### STANDARD

Modo por defecto para nuevas funcionalidades, módulos y vertical slices durante desarrollo.

- revisar reglas globales y documentación directamente relacionada;
- inspeccionar módulos afectados y sus dependencias públicas;
- ejecutar tests unitarios e integración específicos;
- ejecutar E2E únicamente del flujo afectado cuando aplique;
- reutilizar servicios y contenedores ya levantados;
- realizar validación amplia al cierre solo sobre superficies impactadas.

### FULL

Reservado para releases, cambios transversales, migraciones complejas, seguridad crítica, cambios arquitectónicos materiales o cuando la evidencia indique que una validación completa es necesaria.

- revisión amplia de impactos;
- suite completa de pruebas aplicables;
- build completo cuando corresponda;
- validación integral de migraciones, seguridad, Docker, staging y Definition of Done.

No utilizar `FULL` por defecto para tareas normales si `LIGHT` o `STANDARD` pueden validar el cambio de forma suficiente.

## Eficiencia de contexto y ejecución

- No releer el repositorio completo si el alcance puede resolverse con inspección dirigida.
- No volver a leer archivos extensos ya comprendidos si no cambiaron y no son necesarios para la decisión actual.
- Preferir `git diff`, archivos modificados y módulos afectados sobre exploraciones globales repetidas.
- No iniciar agentes, subagentes o exploraciones paralelas salvo que reduzcan claramente el trabajo total o sean necesarias por independencia real de subtareas.
- Evitar repetir análisis, comandos, builds o validaciones cuyo resultado siga siendo válido y cuya superficie no haya cambiado.
- Cuando un log sea grande, inspeccionar primero el segmento relevante al error en lugar de procesar el archivo completo.
- No generar documentación redundante ni repetir estándares ya definidos en la propuesta o en el cierre.

## Eficiencia Docker

- Reutilizar contenedores y servicios existentes cuando estén sanos y correspondan al entorno actual.
- No crear stacks, proyectos Compose, bases de datos o contenedores adicionales únicamente para ejecutar pruebas si el entorno existente puede aislarlas correctamente.
- No reconstruir imágenes si no cambiaron Dockerfile, dependencias o artefactos que requieran rebuild.
- Preferir `docker compose up -d` o ejecución selectiva de servicios sobre recreaciones completas innecesarias.
- No usar `--force-recreate`, `--no-cache`, eliminación de volúmenes o comandos equivalentes salvo necesidad técnica explícita.
- Cualquier operación destructiva sobre volúmenes o bases de datos requiere autorización específica conforme a `AGENTS.md`.

## Estrategia incremental de pruebas

Durante desarrollo normal, validar en este orden cuando aplique:

1. tests unitarios del código afectado;
2. tests de integración de los módulos afectados;
3. E2E del flujo modificado;
4. suite más amplia únicamente al cerrar una tarea de impacto transversal, preparar PR/release o cuando los resultados indiquen riesgo de regresión fuera del alcance local.

Una prueba ya ejecutada no debe repetirse si desde entonces no cambió ninguna superficie que pueda afectarla.

## Formato de la propuesta breve

La propuesta debe incluir únicamente:

- qué se va a construir o modificar;
- entre 3 y 7 criterios de aceptación verificables;
- módulos o áreas principales afectadas;
- impacto en base de datos, API, permisos o integraciones cuando aplique;
- complejidad o riesgo: baja, media o alta;
- modo de ejecución propuesto: `LIGHT`, `STANDARD` o `FULL`;
- si existe un `breaking change`;
- resultado esperado;
- necesidad de ADR cuando corresponda.

No debe repetir arquitectura o estándares ya documentados.

## Complejidad y riesgo

Toda tarea debe clasificarse como baja, media o alta.

Si el riesgo o complejidad es alta, la propuesta debe advertirlo explícitamente y explicar brevemente la causa antes de solicitar aprobación.

## Compatibilidad

Preservar compatibilidad hacia atrás siempre que sea razonable.

Si el cambio rompe contratos, comportamiento esperado o compatibilidad técnica, debe marcarse como `breaking change` en la propuesta antes de ejecutarse.

## Ambigüedad

- Si la ambigüedad es menor y no cambia materialmente el comportamiento, asumir la opción más razonable y declararla en la propuesta.
- Si la ambigüedad afecta reglas de negocio, alcance, seguridad, datos, contratos o comportamiento relevante, solicitar una decisión antes de ejecutar.

## Mejoras fuera de alcance

Si se detecta una mejora útil que no forma parte de la solicitud aprobada, sugerirla aparte. No implementarla sin autorización.

## Tareas grandes

Cuando el alcance sea grande, dividir el trabajo automáticamente en fases o subtareas dentro de la propuesta, manteniendo el objetivo global.

Esta regla aplica también al prompt de vertical slice completa, pero dividir una tarea no autoriza multiplicar innecesariamente agentes, entornos Docker o ciclos de validación.

## Operaciones destructivas

La aprobación general de una tarea nunca autoriza operaciones destructivas.

Antes de ejecutar una operación destructiva, solicitar autorización explícita específica.

Aplican especialmente las reglas críticas de `AGENTS.md` sobre eliminación, reseteo, vaciado, recreación o restauración de bases de datos y pérdida potencial de información.

## Documentación

Actualizar automáticamente la documentación técnica o funcional relevante cuando cambien:

- arquitectura;
- reglas de negocio importantes;
- endpoints o contratos;
- permisos;
- configuración o variables de entorno;
- migraciones;
- integraciones;
- procesos operativos.

Los cambios relevantes de arquitectura o reglas de negocio deben considerar ADR según las normas del repositorio.

## Pruebas

Las pruebas forman parte del mismo cambio y no deben dejarse como tarea posterior cuando la estrategia de testing o la Definition of Done las requieran. Su ejecución debe respetar la estrategia incremental definida arriba.

## Cierre

No es obligatorio generar un resumen final detallado de archivos modificados o cambios realizados, ya que el repositorio y Git son la fuente de trazabilidad.

Solo informar de forma explícita cuando exista:

- un bloqueo;
- un riesgo pendiente;
- una prueba fallida;
- una decisión no resuelta;
- una desviación relevante respecto del alcance aprobado.
