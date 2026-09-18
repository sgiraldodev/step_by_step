# Respaldo y restauración

## Objetivo

Definir cómo proteger y recuperar la información crítica del sistema.

## Respaldo

Todo proyecto productivo con datos persistentes debe contar con backups automáticos y documentar:

- qué datos se respaldan;
- frecuencia;
- retención;
- ubicación de almacenamiento;
- cifrado;
- responsable;
- monitoreo de fallos.

## Restauración

Todo proyecto productivo debe contar con un procedimiento verificable para restaurar datos y comprobar su integridad.

### Regla de autorización

Una restauración sobre un ambiente real o productivo **nunca debe ejecutarse automáticamente**.

Debe requerir autorización explícita del responsable definido para el proyecto.

## Pruebas de restauración

Un backup no se considera confiable únicamente porque fue generado. Deben realizarse pruebas periódicas de restauración en ambientes controlados y no productivos según la criticidad del sistema.

Estas pruebas pueden automatizarse cuando no afecten información real ni ambientes operativos.

## Seguridad

Los respaldos deben protegerse con controles de acceso equivalentes a la sensibilidad de los datos que contienen.
