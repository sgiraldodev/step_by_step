# Estrategia de pruebas

## Objetivo

Detectar regresiones, validar reglas de negocio y permitir cambios seguros sin convertir las pruebas en una carga difícil de mantener.

## Niveles de prueba

1. **Pruebas unitarias:** reglas de negocio, funciones aisladas y comportamiento interno relevante.
2. **Pruebas de integración:** servicios, repositorios, persistencia, APIs e integraciones relevantes.
3. **Pruebas E2E:** flujos críticos completos desde la perspectiva del usuario.

## Herramientas estándar

### Backend

- `pytest` como framework base.

### Frontend

- `Vitest` para pruebas unitarias.
- `Testing Library` para comportamiento de componentes.
- `Playwright` para pruebas E2E.

## Cobertura mínima

El proyecto debe mantener una cobertura global mínima del **80%**.

La cobertura es un indicador complementario y no sustituye la calidad de las pruebas. Alcanzar el porcentaje no exime de probar explícitamente reglas críticas.

En módulos sensibles deben existir pruebas específicas sobre:

- reglas de negocio;
- permisos y autorización;
- transacciones;
- errores esperados;
- persistencia relevante;
- contratos de API críticos;
- escenarios de regresión.

## Reglas

- toda corrección de un bug importante debe considerar una prueba de regresión;
- evitar pruebas dependientes del orden de ejecución;
- no depender de servicios externos reales cuando puedan simularse de forma confiable;
- mantener fixtures comprensibles;
- priorizar comportamiento observable sobre detalles internos de implementación.

## CI

Las pruebas relevantes y la validación de cobertura deben ejecutarse automáticamente en CI antes de integrar cambios a la rama principal.

## Aplicación Pomodoro

`pytest` verifica permisos, aislamiento por cuenta, acciones idempotentes, esfuerzo, rutinas, etiquetas, estadísticas y recuperación. Cada caso crea su propia base temporal; nunca elimina datos existentes. Vitest y Testing Library verifican clientes, reloj y pantallas; Playwright recorre la aplicación en la vista aislada. CI exige 80 % global y comprueba migraciones sobre PostgreSQL independiente. Las dependencias se instalan desde los lockfiles. Los comandos y resultados están en el [registro de migración](migracion-pomodoro.md).
