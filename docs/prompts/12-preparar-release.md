# Prompt estándar — Preparar release

## Prompt

Quiero preparar una versión para staging y posterior producción.

1. Lee `AGENTS.md`, estrategia Git, despliegue, ambientes, testing y Definition of Done.
2. Verifica que los cambios previstos estén integrados mediante PR y que `release` permanezca estable.
3. Lee la fuente única de versión del proyecto, preferiblemente `VERSION`, y valida que refleje correctamente los cambios acumulados según `MAJOR.MINOR.PATCH`.
4. Ejecuta lint, tests, cobertura mínima del 80% y build de imágenes.
5. Revisa migraciones Alembic, compatibilidad y riesgos operativos.
6. Valida secretos/configuración por ambiente sin exponer valores sensibles.
7. Despliega primero a staging y verifica `/health`, `/ready`, errores, métricas y flujos críticos.
8. Prepara changelog con funcionalidades, fixes, migraciones y cambios importantes de negocio.
9. Deriva el TAG productivo directamente desde la versión vigente: si `VERSION` es `1.8.1`, el TAG debe ser `v1.8.1`. No inventes una versión distinta durante el release salvo que detectes un error de clasificación que deba corregirse antes de continuar.
10. Verifica que el TAG propuesto no exista previamente.
11. Versiona imágenes Docker con el TAG y/o SHA, manteniendo la convención `<proyecto>_<servicio>:<version>`; no dependas de `latest`.
12. No despliegues a producción sin aprobación manual explícita.
13. Documenta estrategia de rollback por TAG y cualquier restricción de base de datos.

Entrega:
- checklist de release;
- versión vigente y TAG derivado;
- changelog;
- estado de tests/build;
- migraciones y riesgos;
- validación de staging;
- plan de rollback.
