# Traspaso operativo de Step by Step a DevOps SERQANA

## Propósito

Este documento reúne el contexto necesario para continuar en el proyecto `deVops_SERQANA` la instalación y operación productiva de **Step by Step**. Resume lo ejecutado y verificado durante la preparación del Droplet, las decisiones de arquitectura, la release publicada y el punto exacto desde el cual debe continuar el despliegue.

No contiene contraseñas, tokens, claves privadas ni direcciones de correo privadas. Los secretos reales deben permanecer fuera de Git.

## Estado resumido

La infraestructura base del Droplet y el proxy compartido están preparados. La release productiva `v1.1.1` está publicada en GitHub. Al cerrar este traspaso todavía **no se confirmó** en el chat que el repositorio hubiera sido clonado en `/opt/apps/step_by_step`, que existiera `production.env` o que los contenedores de la aplicación estuvieran iniciados.

El siguiente responsable debe comenzar verificando la clonación del tag `v1.1.1` en el Droplet y continuar desde la sección [Punto exacto de reanudación](#punto-exacto-de-reanudación).

## Identificación del ambiente

| Elemento | Valor o estado |
|---|---|
| Proveedor | DigitalOcean |
| Tipo de servidor | Droplet Ubuntu compartido por varias aplicaciones |
| Host observado en terminal | `serqana-prod` |
| IP reservada | `129.212.198.233` |
| Dominio de la aplicación | `stepbystep.serqana.com` |
| DNS | Registro `A` en Cloudflare hacia `129.212.198.233` |
| Modo Cloudflare durante el despliegue inicial | **Solo DNS**, nube gris |
| Usuario operacional | `deploy` |
| Directorio de infraestructura compartida | `/opt/infra/traefik` |
| Directorio previsto para la aplicación | `/opt/apps/step_by_step` |
| Repositorio | `git@github-step-by-step:sgiraldodev/step_by_step.git` |
| Alias SSH de GitHub en el servidor | `github-step-by-step` |

La clave de despliegue configurada para GitHub es de **solo lectura**. No copiar su clave privada al repositorio DevOps ni a este documento.

## Arquitectura acordada

El Droplet está diseñado para alojar varias aplicaciones sin conflictos de puertos:

```text
Internet
   |
   | TCP 80 / 443
   v
Traefik compartido: platform_traefik
   |
   | red Docker externa: platform_proxy
   +--------------------------+--------------------------+
   |                          |                          |
frontend Step by Step    frontend futura app A     gateway futura app B
   |
   | red interna privada del Compose de Step by Step
   +--> API FastAPI
          |
          +--> PostgreSQL
```

Reglas operativas:

- existe un único Traefik compartido para todo el Droplet;
- solo Traefik publica puertos del host;
- cada aplicación conserva su propia red interna;
- solo el frontend o gateway que recibe tráfico web se conecta también a `platform_proxy`;
- API, PostgreSQL y otros servicios internos no publican puertos del host;
- detener o actualizar una aplicación no debe detener Traefik ni afectar las demás aplicaciones;
- cada aplicación debe usar nombres únicos para routers y services de Traefik.

La decisión formal está documentada en la release `v1.1.1`, archivo `docs/architecture/decisions/ADR-004-despliegue-droplet-traefik.md`.

## Estado verificado del Droplet

### Docker

Se verificó lo siguiente en el servidor:

- Docker Engine `29.8.1`;
- Docker Compose `v5.5.1`;
- servicio Docker activo y habilitado al iniciar;
- driver de almacenamiento `overlayfs`;
- usuario `deploy` perteneciente a los grupos `sudo` y `docker`;
- acceso SSH funcional con el usuario `deploy`.

### Traefik compartido

Se instaló fuera del ciclo de vida de Step by Step:

- directorio: `/opt/infra/traefik`;
- contenedor: `platform_traefik`;
- versión observada: Traefik `v3.7.13`;
- estado observado: saludable;
- red Docker externa: `platform_proxy`;
- resolver ACME: `letsencrypt`;
- configuración privada separada en `traefik.env`;
- volumen de certificados: `platform_traefik_letsencrypt`;
- puertos publicados: `80` y `443`, tanto en IPv4 como en IPv6.

No incorporar Traefik al Compose de Step by Step. No ejecutar `docker compose down` desde `/opt/infra/traefik` como parte de un despliegue de una aplicación.

### Red y firewall

El diseño de exposición aprobado es:

| Puerto | Exposición | Uso |
|---|---|---|
| `22/tcp` | Solo IP administrativas autorizadas | SSH |
| `80/tcp` | Internet | Validación HTTP y redirección de Traefik |
| `443/tcp` | Internet | HTTPS de Traefik |
| `3000/tcp` | No publicar | Frontend interno |
| `8000/tcp` | No publicar | API interna |
| `5432/tcp` | No publicar | PostgreSQL interno |

Las futuras aplicaciones deben reutilizar `80/443` mediante Traefik; no deben reservar nuevos puertos públicos para sus frontends o APIs salvo una decisión explícita y documentada.

## DNS y TLS

- `stepbystep.serqana.com` fue creado en Cloudflare.
- El registro `A` fue actualizado a la IP reservada `129.212.198.233`.
- La resolución pública fue verificada durante la preparación.
- Se mantuvo Cloudflare en modo **Solo DNS** para que Traefik pudiera obtener inicialmente el certificado de Let's Encrypt.
- El certificado definitivo para el dominio todavía debe verificarse después de iniciar la aplicación.
- El proxy de Cloudflare solo debe activarse después de comprobar HTTPS de extremo a extremo y configurar SSL/TLS como **Full (strict)**.

## Release productiva preparada

| Elemento | Valor |
|---|---|
| Rama estable | `release` |
| Rama de preparación | `codex/shared-traefik-production` |
| Commit del cambio | `06ecc58` |
| Pull Request | `https://github.com/sgiraldodev/step_by_step/pull/2` |
| Checks del PR | `8/8` aprobados |
| Commit integrado en `release` | `e57ad832bac3b60e4570f41f0bafd127d20e0030` |
| Versión | `1.1.1` |
| Tag productivo | `v1.1.1` |
| Release | `https://github.com/sgiraldodev/step_by_step/releases/tag/v1.1.1` |

El tag `v1.1.1` fue publicado desde `release`, apunta al commit `e57ad83` y quedó marcado como `Latest` al momento de crearlo.

Validaciones realizadas antes del merge:

- configuración de `compose.production.yaml` válida;
- construcción completa de las imágenes de backend y frontend;
- `git diff --check` sin errores;
- ocho checks de GitHub aprobados;
- Traefik compartido saludable y escuchando únicamente en `80/443`.

## Topología de Step by Step en `v1.1.1`

El tag contiene `compose.production.yaml` con los siguientes servicios:

| Servicio | Contenedor | Red | Publica puerto del host |
|---|---|---|---|
| PostgreSQL 17 | `step_by_step_postgres` | interna | No |
| Migraciones Alembic | `step_by_step_migrations` | interna | No |
| API FastAPI | `step_by_step_backend` | interna | No |
| Frontend Next.js | `step_by_step_frontend` | interna + `platform_proxy` | No |

Otros contratos del Compose:

- volumen persistente: `step_by_step_postgres_data`;
- imágenes: `step_by_step_backend:${IMAGE_TAG}` y `step_by_step_frontend:${IMAGE_TAG}`;
- migraciones ejecutan `alembic upgrade head` y deben terminar correctamente antes del inicio de la API;
- la API expone internamente `/ready` para el health check;
- el frontend expone internamente el puerto `3000`;
- el frontend reenvía `/api/` a la API dentro de la red privada;
- la API usa `America/Bogota`;
- `APP_ORIGIN` y `CORS_ORIGINS` usan `https://stepbystep.serqana.com`.

Labels principales de Traefik en el frontend:

```text
traefik.enable=true
traefik.docker.network=platform_proxy
traefik.http.routers.step_by_step.rule=Host(`stepbystep.serqana.com`)
traefik.http.routers.step_by_step.entrypoints=websecure
traefik.http.routers.step_by_step.tls.certresolver=letsencrypt
traefik.http.services.step_by_step.loadbalancer.server.port=3000
```

## Configuración privada de la aplicación

El archivo `production.env.example` del tag `v1.1.1` define:

```dotenv
IMAGE_TAG=v1.1.1
POSTGRES_DB=pomodoro
POSTGRES_USER=pomodoro
POSTGRES_PASSWORD=REEMPLAZAR_CON_HEX_ALEATORIO
INITIAL_SETUP_TOKEN=REEMPLAZAR_CON_HEX_ALEATORIO
EMAIL_FROM=REEMPLAZAR_CON_REMITENTE_VERIFICADO
RESEND_API_KEY=REEMPLAZAR_CON_CLAVE_REAL
```

Condiciones de seguridad:

- crear `/opt/apps/step_by_step/production.env` únicamente en el servidor;
- no guardar el archivo real en Git ni copiar sus valores a tickets, chats o documentación;
- usar cadenas hexadecimales aleatorias largas para `POSTGRES_PASSWORD` e `INITIAL_SETUP_TOKEN`;
- usar un remitente verificado en Resend;
- proteger el archivo con permisos `600` y propiedad del usuario operacional;
- `IMAGE_TAG` debe permanecer exactamente en `v1.1.1` para este despliegue;
- el correo ACME pertenece a `traefik.env`, no a `production.env`.

## Checklist completado

- [x] Droplet disponible y acceso SSH funcional.
- [x] IP reservada `129.212.198.233` asociada al Droplet.
- [x] DNS de `stepbystep.serqana.com` dirigido a la IP reservada.
- [x] Docker Engine y Docker Compose instalados.
- [x] Usuario `deploy` creado con acceso administrativo y Docker.
- [x] Traefik compartido instalado en `/opt/infra/traefik`.
- [x] Red externa `platform_proxy` creada.
- [x] Traefik saludable y puertos `80/443` publicados.
- [x] Clave de despliegue GitHub de solo lectura configurada.
- [x] Conectividad SSH a GitHub mediante `github-step-by-step` verificada.
- [x] Compose productivo adaptado para el Traefik compartido.
- [x] PR #2 integrado en `release` con todas las validaciones aprobadas.
- [x] Tag y release `v1.1.1` publicados.

## Punto exacto de reanudación

### 1. Comprobar o realizar la clonación del tag

Ejecutar como `deploy` en el Droplet. Antes de clonar, comprobar si `/opt/apps/step_by_step` ya existe para evitar sobrescribir trabajo.

```bash
sudo mkdir -p /opt/apps
sudo chown deploy:deploy /opt/apps
cd /opt/apps
git clone git@github-step-by-step:sgiraldodev/step_by_step.git step_by_step
cd /opt/apps/step_by_step
git checkout v1.1.1
git describe --tags --exact-match
git rev-parse --short HEAD
cat VERSION
```

Resultado esperado:

```text
v1.1.1
e57ad83
1.1.1
```

Si el directorio ya existe, no eliminarlo. Inspeccionar primero:

```bash
cd /opt/apps/step_by_step
git status
git remote -v
git describe --tags --exact-match
git rev-parse --short HEAD
```

### 2. Crear la configuración privada

```bash
cd /opt/apps/step_by_step
umask 077
cp production.env.example production.env
openssl rand -hex 32
openssl rand -hex 32
nano production.env
chmod 600 production.env
```

Los dos resultados de `openssl` se usan, respectivamente, como contraseña de PostgreSQL y token de configuración inicial. No registrarlos en la salida del proyecto DevOps.

Antes de continuar, comprobar solo nombres de variables y permisos; evitar imprimir valores secretos en logs automatizados.

### 3. Validar dependencias compartidas

```bash
docker network inspect platform_proxy
docker ps --filter name=platform_traefik
sudo ss -lntp
```

Debe existir `platform_proxy`, Traefik debe estar saludable y solo deben observarse como puertos web públicos `80/443`.

### 4. Validar y construir la aplicación

```bash
cd /opt/apps/step_by_step
docker compose --env-file production.env -f compose.production.yaml config --quiet
docker compose --env-file production.env -f compose.production.yaml build api frontend
```

No continuar al arranque si la validación o la construcción fallan.

### 5. Iniciar la aplicación

Antes de ejecutar migraciones sobre una base existente, verificar respaldo y compatibilidad del esquema. Para la instalación inicial se esperaba una base vacía; aun así, comprobar el estado real en lugar de asumirlo.

```bash
docker compose --env-file production.env -f compose.production.yaml up -d --wait
docker compose --env-file production.env -f compose.production.yaml ps
docker compose --env-file production.env -f compose.production.yaml logs --tail=100 migrations
```

El servicio de migraciones debe terminar con código `0`; PostgreSQL, API y frontend deben quedar saludables.

### 6. Verificación técnica y funcional

```bash
curl -I http://stepbystep.serqana.com
curl -I https://stepbystep.serqana.com
docker logs --tail=100 platform_traefik
docker compose --env-file production.env -f compose.production.yaml logs --tail=100 api frontend
```

Validar además desde un navegador:

- carga de `https://stepbystep.serqana.com`;
- certificado válido para el dominio;
- registro o configuración inicial;
- inicio de sesión;
- creación y uso básico de tareas/Pomodoro;
- envío real de correo mediante Resend;
- ausencia de errores CORS o respuestas mixtas HTTP/HTTPS.

### 7. Cierre operativo

- [ ] Confirmar que `v1.1.1` es la versión desplegada.
- [ ] Confirmar salud de PostgreSQL, API y frontend.
- [ ] Confirmar certificado Let's Encrypt.
- [ ] Confirmar flujo de correo Resend.
- [ ] Definir backup lógico periódico de PostgreSQL fuera del Droplet.
- [ ] Definir retención, cifrado y prueba de restauración aislada.
- [ ] Documentar procedimiento de actualización por tag.
- [ ] Documentar rollback a un tag compatible.
- [ ] Evaluar activación del proxy Cloudflare con **Full (strict)**.
- [ ] Incorporar monitorización, alertas y revisión de espacio en disco.

## Convención para aplicaciones adicionales

Cada nueva aplicación del Droplet debe seguir este patrón:

```text
/opt/apps/<aplicacion>/
├── compose.production.yaml
├── production.env            # nunca versionado
└── código o archivos de despliegue
```

Requisitos:

1. crear una red interna propia por Compose;
2. conectar solo el frontend o gateway a la red externa `platform_proxy`;
3. no publicar `3000`, `8000`, `5432` ni equivalentes en el host;
4. usar un subdominio distinto por aplicación;
5. usar nombres únicos de router y service de Traefik;
6. mantener nombres de contenedor, volúmenes y bases de datos con prefijo de proyecto;
7. mantener secretos separados por aplicación;
8. no compartir bases de datos ni volúmenes entre aplicaciones por conveniencia;
9. no incluir otro Traefik o Nginx público que compita por `80/443`;
10. validar que detener una aplicación no afecte las demás.

Ejemplo conceptual de labels para otra aplicación:

```yaml
labels:
  - traefik.enable=true
  - traefik.docker.network=platform_proxy
  - traefik.http.routers.<router_unico>.rule=Host(`<subdominio>`)
  - traefik.http.routers.<router_unico>.entrypoints=websecure
  - traefik.http.routers.<router_unico>.tls.certresolver=letsencrypt
  - traefik.http.services.<service_unico>.loadbalancer.server.port=<puerto_interno>
```

## Backups y operaciones destructivas

- Los backups automáticos o snapshots del Droplet no sustituyen un backup lógico verificable de PostgreSQL.
- El backup lógico debe salir del servidor, estar cifrado y tener retención definida.
- La restauración debe probarse primero en un ambiente aislado.
- Nunca eliminar, vaciar, resetear, recrear ni reemplazar una base de datos sin autorización explícita y específica.
- Un rollback de aplicación por tag no revierte automáticamente migraciones.
- No usar `docker compose down -v` en producción: eliminaría volúmenes y puede causar pérdida de datos.
- No eliminar `/opt/apps/step_by_step`, `step_by_step_postgres_data` ni `platform_traefik_letsencrypt` como parte de una actualización normal.

## Pendientes conocidos

Al momento del traspaso no se había verificado en este chat:

- clonación efectiva de `v1.1.1` en el Droplet;
- existencia y permisos de `production.env`;
- configuración válida de Resend;
- construcción de imágenes dentro del Droplet;
- ejecución productiva de migraciones;
- arranque de los contenedores de Step by Step;
- certificado TLS para `stepbystep.serqana.com`;
- prueba funcional completa;
- backup lógico externo de PostgreSQL;
- monitorización y alertas operativas;
- activación final del proxy de Cloudflare.

## Fuentes de verdad

Para continuar o contrastar este traspaso:

- release: `https://github.com/sgiraldodev/step_by_step/releases/tag/v1.1.1`;
- Pull Request de infraestructura: `https://github.com/sgiraldodev/step_by_step/pull/2`;
- `compose.production.yaml` del tag `v1.1.1`;
- `production.env.example` del tag `v1.1.1`;
- `docs/architecture/decisions/ADR-004-despliegue-droplet-traefik.md` del tag `v1.1.1`;
- `docs/operations/deployment.md` del tag `v1.1.1`;
- `docs/operations/environments.md`;
- `docs/operations/backup-restore.md`;
- `docs/development/git-strategy.md`.

Ante cualquier diferencia, prevalecen el estado real del Droplet, el tag productivo inmutable y la documentación formal vigente. No usar una rama de desarrollo como sustituto del tag al desplegar esta versión.
