# Definition of Done

Una tarea no se considera terminada hasta cumplir, cuando aplique, los siguientes criterios.

## Funcionalidad

- [ ] Cumple el requisito solicitado.
- [ ] Respeta las reglas de negocio definidas.
- [ ] No introduce comportamiento fuera de alcance.

## Arquitectura

- [ ] Respeta la arquitectura vigente.
- [ ] No introduce dependencias innecesarias.
- [ ] Las decisiones arquitectónicas nuevas están documentadas mediante ADR cuando corresponde.

## Calidad

- [ ] El código es claro y mantenible.
- [ ] No se duplicaron patrones o componentes existentes.
- [ ] Se agregaron o actualizaron pruebas relevantes.
- [ ] Las pruebas existentes continúan pasando.

## Seguridad

- [ ] No existen secretos ni credenciales en el código.
- [ ] Se validan entradas relevantes.
- [ ] Se aplican permisos/autorización donde corresponde.
- [ ] Los errores no exponen información sensible.

## Datos

- [ ] Las migraciones están creadas y validadas cuando hay cambios de esquema.
- [ ] No se realizan cambios manuales de producción como sustituto de una migración.

## UI/UX

- [ ] Respeta el Design System.
- [ ] Reutiliza componentes existentes.
- [ ] Considera estados de carga, error, vacío, deshabilitado y permisos.
- [ ] Mantiene responsive behavior y accesibilidad.

## Operación

- [ ] La configuración necesaria está documentada.
- [ ] `.env.example` se actualizó si aparecen nuevas variables.
- [ ] El cambio funciona en el entorno soportado.
- [ ] Se revisó el diff final y se eliminó código temporal.

## Documentación

- [ ] La documentación funcional o técnica se actualizó cuando cambió el comportamiento del sistema.
