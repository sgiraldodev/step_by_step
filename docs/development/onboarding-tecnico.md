# Onboarding técnico

## Objetivo

Permitir que una persona nueva pueda entender, levantar, desarrollar, validar y desplegar el proyecto sin depender de explicaciones informales.

## 1. Entender el proyecto

Antes de modificar código, revisar:

1. `README.md`;
2. `AGENTS.md`;
3. `docs/product/`;
4. `docs/architecture/`;
5. `docs/design/`;
6. `docs/development/`;
7. `docs/operations/`;
8. ADRs relevantes.

## 2. Preparar el entorno

- instalar Docker y Docker Compose;
- clonar el repositorio;
- copiar `.env.example` a la configuración local correspondiente;
- completar variables no sensibles requeridas;
- levantar los contenedores;
- verificar `/health` y `/ready`;
- aplicar migraciones Alembic cuando corresponda.

## 3. Trabajar en una funcionalidad

- crear una rama `feature/*`, `fix/*`, `hotfix/*`, `chore/*` o `refactor/*` según el cambio;
- revisar si existe un patrón o componente reutilizable antes de crear uno nuevo;
- respetar arquitectura, Design System y convenciones de API;
- documentar mediante ADR cualquier decisión arquitectónica o regla de negocio material que lo requiera.

## 4. Validar el cambio

Antes de abrir un PR:

- ejecutar lint y format checks;
- ejecutar pruebas unitarias e integración;
- mantener cobertura global mínima del 80%;
- ejecutar E2E cuando el flujo sea crítico;
- validar permisos, errores y estados de UI;
- revisar migraciones si hubo cambios de esquema;
- comprobar la Definition of Done.

## 5. Integración

- abrir Pull Request hacia `release` cuando el cambio esté listo;
- esperar checks de CI;
- corregir cualquier fallo antes de integrar;
- no realizar pushes directos a `release`.

## 6. Staging y producción

- desplegar primero en `staging`;
- validar comportamiento funcional y técnico;
- para producción, utilizar un TAG versionado;
- requerir aprobación manual explícita antes del deploy productivo;
- verificar health checks, logs y métricas después del despliegue.

## 7. Rollback

Si una versión productiva presenta problemas:

- identificar el último TAG estable;
- evaluar compatibilidad de migraciones;
- volver a desplegar ese TAG cuando aplique;
- no revertir automáticamente la base de datos.

## 8. Soporte operativo

Toda persona que opere el proyecto debe conocer:

- ubicación de logs y dashboards;
- proceso de backups;
- procedimiento de restauración;
- gestión de secretos por ambiente;
- proceso de hotfix;
- changelog y TAG actualmente desplegado.
