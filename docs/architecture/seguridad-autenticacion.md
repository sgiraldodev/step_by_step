# Seguridad, autenticación y autorización

## Objetivo

Definir el estándar base para autenticación, autorización, permisos y aislamiento multi-tenant.

## Autenticación

La estrategia por defecto utiliza:

- Access Token JWT de corta duración.
- Refresh Token de mayor duración.

El access token se usa para autenticar requests. El refresh token se usa únicamente para renovar la sesión.

## Almacenamiento del refresh token

En aplicaciones web, el refresh token debe almacenarse en una cookie segura con:

- `HttpOnly`
- `Secure`
- política `SameSite` adecuada

No debe almacenarse en `localStorage`.

## Autorización RBAC

La autorización se basa en permisos granulares. Los roles actúan como agrupadores de permisos.

Ejemplos:

```text
customers.read
customers.create
customers.update
customers.delete
sales.read
sales.create
sales.approve
inventory.adjust
```

La lógica de negocio no debe depender de nombres rígidos de roles como `admin` o `supervisor`.

## Permisos directos por usuario

Los usuarios pueden recibir permisos directos adicionales a los heredados por sus roles.

```text
permisos efectivos
=
permisos de roles
+
permisos directos del usuario
```

No se implementan denegaciones explícitas por defecto. Si un proyecto las necesita, debe documentarse como una decisión adicional.

## Multi-tenant

El starter soporta multi-tenant, pero su uso es opcional por proyecto.

Cuando se active:

- `tenant_id` será el identificador base de aislamiento lógico.
- consultas, servicios y autorización deben respetar el tenant actual;
- el tenant actual debe resolverse desde la identidad autenticada o sesión, no desde parámetros manipulables del frontend como fuente principal;
- cualquier operación transversal entre tenants debe ser explícita, autorizada y auditable.

## Usuarios en múltiples tenants

Un usuario puede pertenecer a varios tenants, pero cada sesión trabaja con un único tenant activo.

El cambio de tenant debe:

1. ser explícito;
2. validar que el usuario pertenece al tenant destino;
3. actualizar de forma segura el contexto de autenticación o sesión.

## Roles globales de plataforma

Los roles globales de plataforma deben permanecer separados de los roles internos de cada tenant.

Estos roles pueden administrar capacidades transversales como tenants, configuración global o soporte, pero sus permisos deben ser explícitos y sus acciones sensibles deben quedar auditadas.
