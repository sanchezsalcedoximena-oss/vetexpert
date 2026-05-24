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

## Frontend

* Next.js funcionando.
* TailwindCSS configurado.
* Landing publica funcional.
* Frontend conectado correctamente al backend.
* Dashboard base protegido funcionando.
* Sidebar moderna responsive implementada.
* Dark mode disponible en acceso y dashboard.

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

## Prisma

Schema ubicado en:

```text
database/schema/schema.prisma
```

Migraciones aplicadas:

* `20260524000000_fase_02_auth`
* `20260524010000_fase_03_landing_contacto`

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

## Estado roadmap

Completado:

* Fase 01
* Fase 02 - Autenticacion
* Fase 03 - Landing Page
* Fase 04 - Acceso y Dashboard Base

Proxima fase:

* Fase 05 - Gestion clientes

## Estado UX/UI

Base visual funcional implementada con landing publica y dashboard moderno.

Pendiente:

* Animaciones avanzadas.
* Charts.
* Mejoras responsive avanzadas por modulo.
