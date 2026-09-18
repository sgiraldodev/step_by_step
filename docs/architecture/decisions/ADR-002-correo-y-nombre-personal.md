# ADR-002: correo como identificador y nombre personal

## Estado

Aceptado por solicitud explícita del usuario.

## Contexto

El producto no necesita un nombre de usuario. Debe permitir que una persona registre su nombre real y recibirla por ese nombre; el correo electrónico identifica la cuenta.

## Decisión

El registro recibe `name`, `email` y `password`. El acceso, recuperación por correo y recuperación por código usan `email`. El servidor normaliza el correo a minúsculas y consulta exclusivamente esa columna. El nombre admite espacios y tildes, conserva mayúsculas, elimina espacios exteriores y tiene de 1 a 100 caracteres. No es único. Las contraseñas no se recortan.

La revisión Alembic `005` añade `users.name` y completa nombres históricos desde `username` cuando existe. La columna histórica permanece para evitar eliminación de información, pero no se escribe para cuentas nuevas ni identifica el acceso. El API público entrega `id`, `name` y `email`, sin `username`. No se alteran IDs, propietarios, sesiones ni historial.

El saludo utiliza «Te damos la bienvenida, {nombre}», sin inferir género ni añadir un campo ajeno al registro solicitado.

## Contratos afectados

Este cambio sustituye intencionalmente `username` por `name` en registro y por `email` en acceso/recuperación. Los clientes deben actualizar esos cuerpos; las rutas existentes se conservan. Esta decisión actualiza la compatibilidad de autenticación descrita en ADR-001; los contratos de enfoque permanecen iguales.

## Verificación y reversión

Pruebas de API verifican nombres repetidos, correo único, mayúsculas, preservación de contraseña, permisos y recuperación. El navegador valida registro con espacios, saludo persistente tras recargar e ingreso por correo. La migración es aditiva; el downgrade automático no elimina el nombre ni información previa.
