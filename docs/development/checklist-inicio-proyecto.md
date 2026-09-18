# Checklist oficial de inicio de proyecto

## Objetivo

Asegurar que todos los proyectos nuevos comiencen con un orden consistente, evitando improvisaciones técnicas y reprocesos.

## 1. Discovery y contexto

- [ ] Definir problema, usuarios y objetivo del producto.
- [ ] Identificar alcance inicial y exclusiones.
- [ ] Registrar términos de negocio en el glosario.
- [ ] Identificar reglas de negocio críticas.
- [ ] Identificar integraciones externas y restricciones.

## 2. Requisitos

- [ ] Completar `docs/product/product-brief.md`.
- [ ] Completar requisitos funcionales y no funcionales.
- [ ] Definir criterios de aceptación.
- [ ] Identificar riesgos y supuestos.

## 3. Arquitectura

- [ ] Confirmar monolito modular como arquitectura por defecto o documentar excepción mediante ADR.
- [ ] Definir módulos de negocio.
- [ ] Confirmar stack tecnológico.
- [ ] Definir estrategia multi-tenant si aplica.
- [ ] Definir autenticación, autorización y permisos.
- [ ] Definir integraciones externas.
- [ ] Definir estrategia de archivos y almacenamiento.

## 4. UX y Design System

- [ ] Definir o adaptar propuesta visual.
- [ ] Consolidar tokens visuales.
- [ ] Definir componentes reutilizables en `components/ui`.
- [ ] Definir navegación, layouts y estados de interfaz.
- [ ] Verificar responsive y accesibilidad.

## 5. Bootstrap técnico

- [ ] Crear estructura backend FastAPI por módulos.
- [ ] Crear estructura frontend Next.js por feature.
- [ ] Configurar PostgreSQL.
- [ ] Configurar Alembic.
- [ ] Configurar `core/config.py` con `pydantic-settings`.
- [ ] Crear `.env.example` sin secretos.
- [ ] Configurar cliente HTTP centralizado.
- [ ] Configurar TanStack Query.
- [ ] Configurar React Hook Form + Zod.
- [ ] Configurar Tailwind CSS y Design System.

## 6. Docker y ambientes

- [ ] Crear Dockerfile de backend.
- [ ] Crear Dockerfile de frontend.
- [ ] Crear Docker Compose para desarrollo.
- [ ] Definir `development`, `staging` y `production`.
- [ ] Verificar `/health` y `/ready`.

## 7. Seguridad

- [ ] Configurar JWT access token + refresh token.
- [ ] Configurar refresh tokens rotativos y revocables.
- [ ] Configurar cookies seguras para refresh token.
- [ ] Configurar Argon2id para contraseñas.
- [ ] Configurar RBAC granular.
- [ ] Configurar rate limiting en endpoints sensibles.
- [ ] Revisar aislamiento de tenant cuando aplique.

## 8. Calidad y testing

- [ ] Configurar pytest.
- [ ] Configurar Vitest + Testing Library.
- [ ] Configurar Playwright cuando aplique.
- [ ] Configurar cobertura mínima global del 80%.
- [ ] Configurar lint y format checks.
- [ ] Definir datos y fixtures de prueba.

## 9. CI/CD

- [ ] Configurar GitHub Actions.
- [ ] Ejecutar lint y pruebas en CI.
- [ ] Validar cobertura.
- [ ] Construir imágenes Docker versionadas.
- [ ] Ejecutar migraciones Alembic de forma controlada.
- [ ] Desplegar primero a staging.
- [ ] Configurar aprobación manual para producción.
- [ ] Configurar secretos mediante GitHub Environments/Secrets.

## 10. Git y versionado

- [ ] Utilizar `release` como rama estable.
- [ ] Proteger `release` contra push directo.
- [ ] Trabajar con ramas `feature/*`, `fix/*` y `hotfix/*`.
- [ ] Crear Pull Request para integrar a `release`.
- [ ] Definir Semantic Versioning.
- [ ] Generar TAG para cada despliegue productivo.
- [ ] Versionar imágenes Docker con TAG y/o SHA.

## 11. Operación

- [ ] Configurar logs estructurados.
- [ ] Configurar `request_id`/`correlation_id`.
- [ ] Configurar métricas, dashboard y alertas.
- [ ] Definir política de backups.
- [ ] Documentar restauración y autorización requerida.
- [ ] Documentar estrategia de rollback por TAG.

## 12. Documentación

- [ ] Completar README operativo.
- [ ] Completar onboarding técnico.
- [ ] Revisar arquitectura y convenciones API.
- [ ] Crear ADRs para decisiones relevantes.
- [ ] Preparar changelog/version history.

## 13. Primera vertical slice

Antes de desarrollar muchos módulos, implementar un flujo completo pequeño que atraviese:

```text
UI
→ API
→ service
→ repository
→ PostgreSQL
→ permisos
→ validaciones
→ testing
→ Docker
→ CI
```

El objetivo es validar tempranamente que toda la arquitectura y el proceso funcionan de extremo a extremo antes de escalar el desarrollo.
