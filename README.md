# VetExpert

Sistema web veterinario profesional desarrollado con:

* Next.js
* NestJS
* PostgreSQL
* Prisma ORM
* TailwindCSS
* TypeScript

---

# Objetivo

Desarrollar un sistema moderno y escalable para clínicas veterinarias que permita:

* Gestión de citas
* Gestión de mascotas
* Gestión de clientes
* Historia clínica veterinaria
* Vacunas
* Reportes
* Portal cliente

---

# Arquitectura

* Clean Architecture
* Monolito modular
* Frontend separado backend
* TypeScript estricto

---

# Stack Tecnológico

## Frontend

* Next.js
* TailwindCSS
* Framer Motion
* Axios

## Backend

* NestJS
* Prisma ORM
* JWT
* bcryptjs

## Base de datos

* PostgreSQL

---

# Desarrollo local

## Frontend

Puerto:
3000

URL:
http://localhost:3000

## Backend

Puerto:
4000

URL:
http://localhost:4000

API Prefix:
api

---

# Prisma

Schema principal:

database/schema/schema.prisma

---

# Funcionalidades implementadas

## Fase 01

* Estructura monolito modular
* Arquitectura base
* Configuración frontend/backend

## Fase 02 — Autenticación

* Login staff JWT
* Refresh token
* Roles:

  * ADMIN
  * SECRETARIA
  * VETERINARIO
  * CLIENTE
* Registro cliente
* Recuperación contraseña
* Guards JWT
* bcryptjs
* Prisma ORM integrado

## Fase 03 — Landing Page

* Landing pública
* Hero section
* Servicios
* Promociones
* Sobre nosotros
* Contacto
* Footer
* WhatsApp flotante
* Formulario contacto
* Persistencia mensajes PostgreSQL

---

# Estructura

/docs
/tasks
/memory
/prompts
/frontend
/backend
/database

---

# Estado actual

Proyecto funcionando correctamente en entorno local.

Frontend y backend conectados correctamente.

Landing y autenticación base implementadas.

---

# Próximas fases

* Seed admin inicial
* Login real completo
* Dashboard administrativo
* Gestión clientes
* Gestión mascotas
* Gestión citas
* Portal cliente
* Reportes
* UX/UI premium
