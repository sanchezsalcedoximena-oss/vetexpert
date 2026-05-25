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

## Gestion Mascotas implementada

Backend:

* `GET /api/mascotas`
* `GET /api/mascotas/:id`
* `POST /api/mascotas`
* `PATCH /api/mascotas/:id`
* `DELETE /api/mascotas/:id`
* Paginacion.
* Busqueda libre (en nombre mascota, raza, nombre/apellido/DNI del cliente).
* Filtros por especie, estado y clienteId.
* Soft delete (activo = false y eliminadoEn).
* Validacion de existencia, rol CLIENTE y estado activo del dueño (clienteId).
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

* `/dashboard/mascotas`.
* Tabla responsive en desktop y tarjetas en mobile.
* Emojis identificadores por especie.
* Buscador debounceado (250ms).
* Filtros por estado y especie.
* Paginacion funcional.
* Modal de crear y editar.
* Selector de dueño interactivo con busqueda y autocompletado en tiempo real (consumiendo `/api/clientes`).
* Calculo visual dinamico de edad del animal.
* Drawer lateral con detalle completo de la mascota e informacion del dueño.
* Alertas Toast animadas.
* Skeleton loaders.
* Confirmacion de borrado.

## Prisma

Schema ubicado en:

```text
database/schema/schema.prisma
```

Migraciones aplicadas:

* `20260524000000_fase_02_auth`
* `20260524010000_fase_03_landing_contacto`
* `20260524020000_fase_05_clientes`
* `20260525001051_fase_06_mascotas`

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

Mascotas:

* `GET /api/mascotas`
* `GET /api/mascotas/:id`
* `POST /api/mascotas`
* `PATCH /api/mascotas/:id`
* `DELETE /api/mascotas/:id`

## Estado roadmap

Completado:

* Fase 01
* Fase 02 - Autenticacion
* Fase 03 - Landing Page
* Fase 04 - Acceso y Dashboard Base
* Fase 04.1 - Seed Admin Inicial
* Fase 05 - Gestion clientes
* Fase 06 - Mascotas

Proxima fase funcional:

* Fase 07 - Citas

## Estado UX/UI

Base visual funcional implementada con landing publica y dashboard moderno.

Pendiente:

* Animaciones avanzadas.
* Charts.
* Mejoras responsive avanzadas por modulo.
