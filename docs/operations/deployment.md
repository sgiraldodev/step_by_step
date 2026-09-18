# Despliegue

## Objetivo

Definir un proceso reproducible, seguro y verificable para llevar cambios a cada ambiente.

## Docker desde el inicio

Todo proyecto nuevo debe nacer dockerizado desde el comienzo.

Como base:

- backend con su `Dockerfile`;
- frontend con su `Dockerfile`;
- PostgreSQL para desarrollo local;
- `docker-compose.yml` para levantar el entorno de desarrollo;
- servicios adicionales solo cuando el proyecto realmente los necesite.

## Convención de nombres Docker

Las imágenes y servicios Docker deben tener nombres claros, legibles y asociados explícitamente al proyecto y a su responsabilidad.

Convención base:

```text
<proyecto>_<servicio>
```

Ejemplos:

```text
trazenda_frontend
trazenda_backend
trazenda_postgres
trazenda_worker
trazenda_redis
```

No utilizar como nombre principal identificadores ambiguos, números aislados, hashes, nombres automáticos difíciles de reconocer o términos genéricos como `app`, `server`, `container1` o `image2` cuando exista una denominación de proyecto disponible.

La versión debe expresarse mediante TAG y/o commit SHA, sin sustituir el nombre descriptivo de la imagen.

Ejemplos recomendados:

```text
trazenda_frontend:v0.1.0
trazenda_backend:v0.1.0
trazenda_backend:a1b2c3d
```

Cuando se publique en un registry, se conserva la misma intención semántica aunque exista un prefijo de organización o registry:

```text
registry.example.com/trazenda_backend:v0.1.0
```

Para imágenes de terceros como PostgreSQL, Redis o Nginx, puede utilizarse la imagen oficial del proveedor, pero el nombre del servicio y del contenedor dentro del proyecto debe seguir siendo identificable, por ejemplo `trazenda_postgres`.

La nomenclatura debe mantenerse consistente entre desarrollo, staging y producción. Si es necesario distinguir ambiente, se recomienda hacerlo mediante configuración, labels, stack/proyecto de Compose o un sufijo explícito, sin perder el nombre base del proyecto y servicio.

## Principios

- automatizar pasos repetibles;
- evitar cambios manuales no trazables;
- validar antes de desplegar;
- separar build, configuración y secretos;
- permitir identificar claramente qué versión está desplegada;
- conservar capacidad de rollback.

## Pipeline mínimo con GitHub Actions

Todo proyecto debe incluir al menos:

1. validación de formato y lint;
2. ejecución de pruebas automatizadas;
3. validación de cobertura mínima;
4. construcción de imágenes Docker;
5. publicación de artefactos o imágenes versionadas;
6. ejecución controlada de migraciones cuando corresponda;
7. despliegue al ambiente objetivo;
8. verificación de health checks y comportamiento crítico.

## Migraciones de base de datos

Todo cambio de esquema debe versionarse mediante Alembic.

Las migraciones no deben depender de una ejecución manual como flujo normal de producción. Deben ejecutarse como un paso explícito, controlado y trazable dentro del pipeline de CI/CD antes de publicar la nueva versión cuando la naturaleza del despliegue lo requiera.

Debe evaluarse compatibilidad hacia atrás cuando una migración pueda afectar una versión todavía en ejecución.

## CI/CD

GitHub Actions es el estándar por defecto.

Las credenciales y secretos deben gestionarse fuera del repositorio mediante los mecanismos de secretos y ambientes correspondientes.

## Producción

Los despliegues productivos deben ser trazables a un commit, tag o versión identificable.

## Instalación local de Pomodoro

Usar `compose.yaml` y seguir el [README](../../README.md). El servicio `migrations` aplica Alembic antes del backend. Los contenedores operativos son `step_by_step_postgres`, `step_by_step_backend` y `step_by_step_frontend`; el volumen propio es `step_by_step_postgres_data`. Las pruebas usan bases aisladas. No copiar ni modificar la base original. Esta tarea habilita operación local; no publica una instancia externa.
