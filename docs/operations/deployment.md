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

## Publicación inicial de Step by step

La infraestructura de producción usa `compose.production.yaml`, según [ADR-004](../architecture/decisions/ADR-004-despliegue-droplet-traefik.md). El dominio es `stepbystep.serqana.com`; el registro A de Cloudflare apunta a la IP reservada del Droplet y permanece inicialmente en modo **Solo DNS**. Un Traefik compartido y administrado separadamente obtiene los certificados Let's Encrypt y sirve HTTPS para todas las aplicaciones del servidor. El frontend reenvía `/api/` a la API por la red privada de Compose. Solo Traefik publica 80 y 443; la API y PostgreSQL no publican puertos.

### Preparación del Droplet

1. Mantener Ubuntu actualizado, crear un usuario administrativo con clave SSH y restringir SSH a las IP autorizadas. Instalar Docker Engine y el complemento Docker Compose con las instrucciones oficiales para Ubuntu.
2. Configurar el firewall de DigitalOcean para permitir TCP 80 y 443 desde Internet y TCP 22 solo desde las IP administrativas. No abrir 3000, 8000 ni 5432.
3. Conservar los respaldos automáticos del Droplet y definir un respaldo lógico periódico de PostgreSQL fuera del servidor, con retención, cifrado y una prueba de restauración en un ambiente aislado. Los respaldos de infraestructura no sustituyen esa prueba.
4. Instalar el Traefik compartido fuera del directorio de la aplicación, crear la red Docker externa `platform_proxy` y configurar el resolver ACME con el nombre `letsencrypt`. Traefik es el único servicio que publica 80 y 443.
5. Permitir que el Droplet lea el repositorio privado mediante una clave de despliegue de solo lectura o entregar las imágenes versionadas desde un registry. No guardar credenciales Git en el repositorio.
6. Verificar que `stepbystep.serqana.com` resuelve a la IP reservada antes de desplegar la aplicación. El puerto 80 debe ser alcanzable para la validación HTTP de Let's Encrypt.

### Configuración privada

En el Droplet, copiar `production.env.example` a `production.env` y sustituir todos los marcadores. Generar `POSTGRES_PASSWORD` e `INITIAL_SETUP_TOKEN` como cadenas hexadecimales aleatorias largas; la contraseña entra en una URL de conexión y no debe contener caracteres que requieran codificación. Usar un remitente de dominio verificado para Resend. El correo ACME pertenece exclusivamente a la configuración privada del Traefik compartido. Proteger ambos archivos de entorno para lectura exclusiva de sus respectivos usuarios de operación. `production.env` está excluido de Git.

`IMAGE_TAG` debe ser `v` seguido del contenido exacto de `VERSION`. Las imágenes y la versión expuesta por la API se construyen con ese valor. Nunca usar `latest` para producción.

### Release y despliegue

1. Integrar el Pull Request en `release` después de que CI pase. La rama `release` no recibe pushes directos.
2. Crear el TAG anotado `v<contenido de VERSION>` sobre el commit integrado y publicarlo en el remoto. Confirmar que el TAG resuelve al mismo commit de `release`.
3. En el Droplet, obtener ese TAG y comprobar que `production.env` contiene el mismo `IMAGE_TAG`.
4. Antes de ejecutar migraciones, comprobar el respaldo de la base existente y evaluar compatibilidad del esquema. Las migraciones son un paso controlado del despliegue; nunca ejecutar restauraciones o borrados sin autorización específica.
5. Validar la configuración con `docker compose --env-file production.env -f compose.production.yaml config --quiet`, construir con `docker compose --env-file production.env -f compose.production.yaml build api frontend` e iniciar con `docker compose --env-file production.env -f compose.production.yaml up -d --wait`. El servicio `migrations` debe terminar correctamente antes de que arranque la API.
6. Comprobar `https://stepbystep.serqana.com`, el flujo de registro y correo, y la salud de los contenedores. Revisar los logs del Traefik compartido y de la API ante fallos. Activar después el proxy de Cloudflare solo con SSL/TLS **Full (strict)** y un certificado de origen válido.

Este procedimiento aún es manual: CI valida y construye las imágenes, pero no ejecuta una publicación automática en el Droplet. La publicación requiere la aprobación operativa definida para producción.
