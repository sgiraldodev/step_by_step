# Prompt estándar — Crear integración externa

## Prompt

Quiero integrar un servicio externo con la aplicación.

1. Lee `AGENTS.md`, `docs/architecture/integraciones.md`, seguridad, configuración y observabilidad.
2. Revisa si ya existe una integración reutilizable o un contrato común.
3. Encapsula el proveedor bajo `app/integrations/`; no llames SDKs o APIs externas directamente desde routers o repositorios.
4. Haz que `service.py` coordine la operación de negocio.
5. Obtén credenciales y endpoints desde configuración centralizada; nunca hardcodees secretos.
6. Traduce errores técnicos del proveedor a errores propios de integración/aplicación.
7. Propaga `request_id`/`correlation_id` cuando aplique y no registres secretos.
8. Define timeout, reintentos e idempotencia cuando el proveedor y el caso de uso lo requieran.
9. Para tareas críticas o reintentables, usa una cola dedicada; BackgroundTasks solo para tareas simples no críticas.
10. Usa mocks/fakes en pruebas cuando sea posible y documenta variables de entorno y operación.

Entrega:
- contrato de integración;
- flujo de negocio;
- configuración requerida;
- manejo de errores/reintentos;
- implementación;
- pruebas;
- documentación.
