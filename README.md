# VetExpert

Sistema web veterinario profesional desarrollado con Next.js, NestJS, PostgreSQL, Prisma ORM, TailwindCSS y TypeScript estricto.

## Objetivo

Construir un sistema moderno y escalable para clinicas veterinarias con landing publica, autenticacion, dashboard interno y modulos progresivos para clientes, mascotas, citas, historia clinica, vacunas, reportes y portal cliente.

## Arquitectura

* Clean Architecture.
* Monolito modular.
* Frontend separado del backend.
* Componentes reutilizables.
* TypeScript estricto.

## Desarrollo local

Frontend:

```bash
npm run dev:frontend
```

URL: `http://localhost:3000`

Backend:

```bash
npm run dev:backend
```

URL: `http://localhost:4000`

API prefix: `/api`

## Prisma

Schema principal:

```text
database/schema/schema.prisma
```

## Funcionalidades implementadas

Fase 01:

* Estructura monolito modular.
* Arquitectura base frontend/backend.

Fase 02 - Autenticacion:

* Login staff JWT.
* Login cliente JWT.
* Refresh token.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`, `CLIENTE`.
* Registro cliente.
* Recuperacion de contrasena preparada.
* Guards JWT.
* Hash con `bcryptjs`.

Fase 03 - Landing Page:

* Landing publica.
* Hero, servicios, promociones, sobre nosotros, contacto y footer.
* WhatsApp flotante.
* Formulario de contacto conectado al backend.
* Persistencia de mensajes en PostgreSQL.

Fase 04 - Acceso y Dashboard Base:

* Login visual staff en `/staff/login`.
* Login visual cliente en `/portal/login`.
* Registro cliente en `/portal/registro`.
* Persistencia JWT en frontend.
* Interceptor Axios con refresh token automatico.
* Guards frontend para `/dashboard`.
* Logout.
* Dashboard base protegido.
* Sidebar moderna responsive.
* Header con avatar, breadcrumbs y dark mode.
* Rutas protegidas base: `/dashboard`, `/dashboard/clientes`, `/dashboard/mascotas`, `/dashboard/citas`.

## Estado actual

Proyecto funcionando en entorno local. Landing publica, contacto, autenticacion y dashboard base implementados.
