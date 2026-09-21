# ADR-004 — Despliegue inicial en un Droplet con Traefik

## Estado

Aceptado

## Contexto

El proyecto necesita publicarse en `stepbystep.serqana.com` y compartir el Droplet con futuros contenedores. El frontend ya reenvía `/api/` a la API por la red interna de Docker. La base de datos debe permanecer privada.

## Decisión

Usar un Droplet Ubuntu con Docker Compose. Un Traefik compartido, operado fuera del ciclo de vida de esta aplicación, recibe HTTP y HTTPS en los puertos 80 y 443, obtiene certificados Let's Encrypt y dirige cada subdominio a su frontend. `step_by_step` conecta únicamente su frontend a la red externa `platform_proxy`; la API y PostgreSQL permanecen en la red interna de su propio Compose y no publican puertos del host. Las aplicaciones adicionales pueden conectarse a `platform_proxy` y registrar rutas independientes mediante labels.

El entorno local conserva su Compose y puertos actuales. La infraestructura compartida mantiene su propio Compose en `/opt/infra/traefik`. Producción usa `compose.production.yaml` y `production.env` bajo `/opt/apps/step_by_step`, con imágenes identificadas por el TAG del release. Detener o actualizar la aplicación no detiene Traefik ni afecta las rutas de otros proyectos.

## Alternativas consideradas

- Nginx con archivos de configuración por sitio: requiere mantener manualmente las rutas y certificados de cada contenedor.
- Un Droplet por aplicación: simplifica el aislamiento, pero aumenta el costo inicial.
- DigitalOcean App Platform: administra el despliegue, pero no corresponde al servidor compartido con varios contenedores elegido para esta etapa.

## Consecuencias

### Positivas

- Un único punto público para varios servicios y certificados automáticos.
- El proxy conserva un ciclo de vida independiente de las aplicaciones publicadas.
- API y base de datos sin exposición directa a Internet.
- El despliegue inicial puede realizarse desde un TAG de Git sin registry.

### Negativas o costos

- El Traefik compartido lee el socket Docker para descubrir los servicios; se debe restringir el acceso al Droplet y mantenerlo actualizado independientemente de esta aplicación.
- La red externa `platform_proxy` y el resolver `letsencrypt` son contratos operativos que deben existir antes de desplegar la aplicación.
- La disponibilidad depende de un único Droplet.
- El operador debe asegurar respaldos verificables de PostgreSQL además de los respaldos de infraestructura.

## Impacto

Infraestructura, configuración del dominio, certificados, imágenes, seguridad de red y operación de respaldos.

## Estrategia de reversión o migración

La aplicación puede volver a un TAG anterior compatible con el esquema de datos sin modificar el proxy compartido. Las migraciones de base de datos requieren una evaluación separada. Traefik se puede reemplazar por otro proxy conservando el contrato de red y enrutamiento, sin cambiar los contratos de frontend y API.
