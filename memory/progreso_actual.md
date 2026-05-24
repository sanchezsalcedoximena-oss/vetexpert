# Progreso Actual - VetExpert

## Estado General

Proyecto funcionando correctamente en entorno local.

## Backend

* NestJS funcionando.
* Prisma ORM configurado.
* PostgreSQL conectado.
* Migraciones funcionando.
* Prisma Client generado correctamente.
* API funcionando en puerto 4000.
* Seed admin inicial implementado y probado.
* Modulo clientes implementado con CRUD protegido.

## Frontend

* Next.js funcionando.
* TailwindCSS configurado.
* Landing publica funcional.
* Frontend conectado correctamente al backend.
* Dashboard base protegido funcionando.
* Sidebar moderna responsive implementada.
* Dark mode disponible en acceso y dashboard.
* Gestion de clientes funcional en `/dashboard/clientes`.

## Autenticacion implementada

* Login staff JWT.
* Login cliente JWT.
* Refresh token.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`, `CLIENTE`.
* Registro cliente.
* Recuperacion de contrasena preparada.
* Guards JWT backend.
* Guards frontend para rutas privadas.
* Hash bcryptjs.
* Persistencia JWT frontend.
* Interceptor Axios con refresh automatico.
* Logout frontend.

## Landing Page implementada

* Hero section.
* Servicios.
* Promociones.
* Sobre nosotros.
* Contacto.
* Footer.
* WhatsApp flotante.
* Formulario contacto funcional.
* Persistencia mensajes PostgreSQL.

## Dashboard Base implementado

* Ruta `/dashboard` protegida.
* Rutas base protegidas `/dashboard/clientes`, `/dashboard/mascotas`, `/dashboard/citas`.
* Layout interno con sidebar, header, avatar y breadcrumbs.
* Dark mode persistente.
* Vista responsive mobile/desktop.
* Logout funcional.

## Seed Admin Inicial implementado

* Script `npm run prisma:seed`.
* Usuario `admin@vetexpert.com`.
* Password inicial `Admin123*`.
* Rol `ADMIN`.
* Password hasheado bcryptjs.
* Seed idempotente probado: no duplica usuario.

## Gestion Clientes implementada

Backend:

* `GET /api/clientes`
* `GET /api/clientes/:id`
* `POST /api/clientes`
* `PATCH /api/clientes/:id`
* `DELETE /api/clientes/:id`
* Paginacion.
* Busqueda.
* Filtros por estado.
* Soft delete.
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`.

Frontend:

* `/dashboard/clientes`.
* Tabla responsive.
* Buscador.
* Filtros.
* Paginacion.
* Crear cliente.
* Editar cliente.
* Eliminar cliente.
* Modal detalle.
* Skeleton loaders.
* Toast notifications.

## Prisma

Schema ubicado en:

```text
database/schema/schema.prisma
```

Migraciones aplicadas:

* `20260524000000_fase_02_auth`
* `20260524010000_fase_03_landing_contacto`
* `20260524020000_fase_05_clientes`

## Endpoints activos

Auth:

* `POST /api/auth/staff/login`
* `POST /api/auth/clientes/login`
* `POST /api/auth/staff/google`
* `POST /api/auth/clientes/registro`
* `POST /api/auth/refresh`
* `POST /api/auth/recuperar`
* `GET /api/auth/perfil`

Contacto:

* `POST /api/contacto/mensajes`

Clientes:

* `GET /api/clientes`
* `GET /api/clientes/:id`
* `POST /api/clientes`
* `PATCH /api/clientes/:id`
* `DELETE /api/clientes/:id`

## Estado roadmap

Completado:

* Fase 01
* Fase 02 - Autenticacion
* Fase 03 - Landing Page
* Fase 04 - Acceso y Dashboard Base
* Fase 04.1 - Seed Admin Inicial
* Fase 05 - Gestion clientes

Proxima fase funcional:

* Fase 06 - Mascotas

## Estado UX/UI

Base visual funcional implementada con landing publica y dashboard moderno.

Pendiente:

* Animaciones avanzadas.
* Charts.
* Mejoras responsive avanzadas por modulo.
