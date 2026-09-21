# ADR-004 — Despliegue inicial en un Droplet con Traefik

## Estado

Aceptado

## Contexto

El proyecto necesita publicarse en `stepbystep.serqana.com` y compartir el Droplet con futuros contenedores. El frontend ya reenvía `/api/` a la API por la red interna de Docker. La base de datos debe permanecer privada.

## Decisión

Usar un Droplet Ubuntu con Docker Compose. Traefik recibe HTTP y HTTPS en los puertos 80 y 443, obtiene un certificado Let's Encrypt y dirige el subdominio al frontend. La API y PostgreSQL se conectan por la red interna; no publican puertos del host. Otros proyectos podrán conectarse a la red `step_by_step_proxy` y registrar sus propias rutas en Traefik.

El entorno local conserva su Compose y puertos actuales. Producción usa `compose.production.yaml` y `production.env`, con imágenes identificadas por el TAG del release.

## Alternativas consideradas

- Nginx con archivos de configuración por sitio: requiere mantener manualmente las rutas y certificados de cada contenedor.
- Un Droplet por aplicación: simplifica el aislamiento, pero aumenta el costo inicial.
- DigitalOcean App Platform: administra el despliegue, pero no corresponde al servidor compartido con varios contenedores elegido para esta etapa.

## Consecuencias

### Positivas

- Un único punto público para varios servicios y certificados automáticos.
- API y base de datos sin exposición directa a Internet.
- El despliegue inicial puede realizarse desde un TAG de Git sin registry.

### Negativas o costos

- Traefik lee el socket Docker para descubrir los servicios; se debe restringir el acceso al Droplet y mantener actualizado Traefik.
- La disponibilidad depende de un único Droplet.
- El operador debe asegurar respaldos verificables de PostgreSQL además de los respaldos de infraestructura.

## Impacto

Infraestructura, configuración del dominio, certificados, imágenes, seguridad de red y operación de respaldos.

## Estrategia de reversión o migración

La aplicación puede volver a un TAG anterior compatible con el esquema de datos. Las migraciones de base de datos requieren una evaluación separada. Traefik se puede reemplazar por otro proxy sin cambiar los contratos de frontend y API.
