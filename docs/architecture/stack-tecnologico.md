# Stack tecnológico oficial

## Propósito

Este documento define el stack tecnológico por defecto para los proyectos creados a partir de este starter. Su objetivo es reducir decisiones repetitivas, acelerar el arranque y mantener consistencia entre proyectos.

El stack por defecto no es una obligación ciega. Puede cambiar cuando exista una razón técnica, operativa o de negocio clara. Toda desviación material debe quedar documentada mediante un ADR.

## Principio general

**Convención sobre elección.** Si el proyecto no presenta una necesidad especial, se utiliza el stack estándar sin volver a debatir cada tecnología.

## Stack por defecto

| Área | Tecnología / enfoque | Estado |
|---|---|---|
| Arquitectura | Monolito modular | Estándar |
| Backend | Python + FastAPI | Estándar |
| API | REST + OpenAPI | Estándar |
| Validación | Pydantic | Estándar |
| ORM | SQLAlchemy 2.x | Estándar |
| Migraciones | Alembic | Estándar |
| Base de datos | PostgreSQL | Estándar |
| Frontend | Next.js + React + TypeScript | Estándar |
| Estilos | CSS moderno + sistema de tokens del Design System | Estándar |
| Autenticación | OAuth2/JWT según el contexto del producto | Estándar |
| Autorización | RBAC | Estándar |
| Backend testing | pytest | Estándar |
| Frontend testing | Vitest/Testing Library | Preferido |
| E2E | Playwright | Preferido cuando aplique |
| Contenedores | Docker | Estándar |
| Desarrollo local | Docker Compose | Estándar |
| Repositorio | GitHub | Estándar |
| CI/CD | GitHub Actions | Estándar |
| Configuración | Variables de entorno + `.env.example` | Estándar |
| Contratos | OpenAPI generado por FastAPI | Estándar |
| Formato/lint Python | Ruff | Preferido |
| Tipado Python | mypy o pyright cuando el proyecto lo requiera | Preferido |
| Formato/lint frontend | ESLint + Prettier | Estándar |

## Arquitectura por defecto

Se inicia con **monolito modular**.

Cada dominio funcional debe vivir en un módulo explícito, con límites claros y dependencias controladas. El objetivo es conservar simplicidad operativa sin convertir el sistema en un monolito desorganizado.

No se utilizan microservicios de inicio salvo que exista una necesidad demostrable, por ejemplo:

- escalado independiente real;
- aislamiento operacional o regulatorio;
- equipos independientes con ciclos de despliegue separados;
- requerimientos de disponibilidad diferentes;
- integración con capacidades que deban ejecutarse como servicios independientes.

Adoptar microservicios requiere ADR.

## Backend

### Python + FastAPI

FastAPI es el framework backend por defecto para APIs y aplicaciones web del ecosistema.

Reglas:

- los routers/controladores manejan transporte HTTP, no reglas de negocio;
- los servicios/casos de uso coordinan comportamiento de aplicación;
- la persistencia se encapsula para evitar acoplamiento innecesario;
- los esquemas de entrada y salida se validan con Pydantic;
- las dependencias transversales se resuelven mediante mecanismos explícitos;
- los errores deben mapearse de forma consistente a respuestas HTTP.

### SQLAlchemy

SQLAlchemy 2.x es el ORM por defecto. SQLModel puede utilizarse únicamente si aporta simplicidad real al proyecto y la decisión queda explícita en la arquitectura.

### Alembic

Todo cambio de esquema de base de datos debe realizarse mediante migraciones versionadas. No se modifican estructuras de producción manualmente como práctica normal.

## Base de datos

PostgreSQL es la base de datos relacional por defecto.

Se utilizará otra tecnología cuando el caso de uso lo justifique claramente, por ejemplo un motor especializado de búsqueda, cache, series de tiempo, grafos o procesamiento analítico. Agregar otro motor de persistencia requiere justificar su responsabilidad y ciclo de vida.

## Frontend

### Next.js + React + TypeScript

Es el stack frontend por defecto para aplicaciones web.

Reglas:

- TypeScript es obligatorio salvo excepción documentada;
- los componentes deben reutilizar el Design System;
- separar componentes de presentación, comportamiento y acceso a datos cuando la complejidad lo requiera;
- no duplicar lógica de negocio que pertenezca al backend;
- manejar explícitamente estados de carga, error, vacío y permisos;
- mantener accesibilidad y responsive behavior.

## API

REST es el estilo de API por defecto y OpenAPI es la fuente de documentación contractual.

No se introduce GraphQL, gRPC u otro protocolo sin un caso de uso concreto que lo justifique.

## Autenticación y autorización

El estándar contempla:

- autenticación basada en estándares como OAuth2 y tokens JWT cuando sea apropiado;
- autorización RBAC como punto de partida;
- permisos evaluados del lado servidor;
- ningún secreto en frontend ni repositorio;
- contraseñas almacenadas únicamente mediante algoritmos de hashing adecuados;
- expiración, revocación o renovación de sesiones/tokens según el nivel de riesgo del producto.

Los detalles exactos deben definirse por proyecto en función de los actores y requisitos de seguridad.

## Infraestructura local

Docker es el estándar de empaquetado y Docker Compose el estándar inicial para desarrollo local y entornos simples.

Un proyecto típico puede contener:

- frontend;
- backend;
- PostgreSQL;
- servicios auxiliares estrictamente necesarios.

Kubernetes no es una dependencia por defecto del starter. Se adopta cuando la escala u operación lo justifique.

## CI/CD

GitHub Actions es el estándar de automatización.

Como mínimo, una pipeline madura debe poder ejecutar:

1. instalación reproducible de dependencias;
2. lint/format checks;
3. pruebas;
4. validaciones de seguridad aplicables;
5. build;
6. publicación/despliegue según ambiente.

El despliegue debe permanecer desacoplado de secretos almacenados en el repositorio.

## Dependencias

Antes de agregar una dependencia se debe comprobar:

1. que el problema no esté resuelto por el lenguaje o framework;
2. que no exista ya una dependencia equivalente;
3. que el proyecto tenga mantenimiento activo y una licencia compatible;
4. que el beneficio supere el costo operacional y de seguridad.

## Decisiones que requieren ADR

Como mínimo requieren ADR:

- cambiar de monolito modular a microservicios;
- cambiar FastAPI por otro framework backend;
- cambiar PostgreSQL como persistencia principal;
- introducir un segundo motor persistente importante;
- cambiar Next.js/React como frontend principal;
- introducir GraphQL o gRPC como contrato principal;
- adoptar Kubernetes como requisito base de operación;
- introducir un proveedor o mecanismo de identidad que condicione la arquitectura;
- cualquier decisión difícil de revertir o con impacto transversal.

## Excepciones

Una excepción no se considera una desviación negativa. El objetivo del estándar es eliminar decisiones innecesarias, no impedir decisiones correctas.

Cuando se aparte del stack por defecto, el equipo o agente debe documentar:

- contexto;
- alternativa elegida;
- motivo;
- consecuencias;
- estrategia de reversión o migración cuando aplique.
