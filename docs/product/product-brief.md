# Product Brief

## Producto

**Nombre:** Step by step · Pomodoro Santi.
**Descripción:** Organizador personal de tareas y rutinas con bloques de enfoque y estadísticas de tiempo efectivo.

## Problema y usuarios

Personas que necesitan organizar pendientes, repetir hábitos diarios y conocer cuánto tiempo dedican a cada actividad. Cada cuenta trabaja en un espacio privado; no existen roles administrativos ni espacios compartidos.

## Propuesta de valor

Trabajar un bloque a la vez, conservar el progreso al recargar y distinguir ciclos completados de esfuerzo efectivo sin duplicarlo al reintentar.

## Flujos principales

1. Registrarse, guardar el código de recuperación e iniciar sesión.
2. Crear tareas con prioridad y etiquetas, iniciar, pausar, resolver, cambiar o restaurar una tarea.
3. Crear rutinas permanentes, completar el registro de hoy y revisar su historial.
4. Consultar esfuerzo por rango de fechas, etiqueta y día.
5. Personalizar duraciones y tema del navegador.

## MVP y restricciones

Incluye todo el comportamiento implementado en Pomodoro Santi. No incluye colaboración, administración, integración de calendarios ni sincronización del reloj entre dispositivos o pestañas. PostgreSQL es la persistencia operativa; Bogotá es la zona horaria de negocio predeterminada. SMTP es la única integración externa opcional.

## Reglas y criterios de éxito

Los contratos y reglas verificables se mantienen en `requirements.md` y el manual de usuario. La migración debe preservar funcionalidades, aislamiento por propietario, historial Alembic, identidad visual y las pruebas originales. Las particularidades frente al starter están justificadas en ADR-001.
