# VetExpert - Contexto General del Proyecto

## Arquitectura

- Clean Architecture.
- Monolito modular.
- Backend y frontend separados.
- TypeScript estricto.
- Componentes reutilizables.
- Codigo mantenible y escalable.

No usar microservicios.

---

## Stack

Frontend:

- Next.js App Router.
- TypeScript estricto.
- TailwindCSS.
- shadcn/ui.

Backend:

- NestJS.
- Prisma ORM.
- PostgreSQL.
- JWT.

---

## Alcance confirmado

VetExpert es un sistema web veterinario administrativo, exclusivamente staff-only.

No existe:

- Portal cliente.
- Login cliente.
- Registro publico cliente.
- Recuperacion cliente.
- Autenticacion cliente.
- Sesiones cliente.
- JWT cliente.
- `TipoUsuario`.
- `Rol.CLIENTE`.

Los clientes existen solo como registros administrativos internos. Representan duenos de mascotas, datos de contacto y relaciones operativas con mascotas, citas e historias clinicas.

---

## Roles activos

- `ADMIN`.
- `VETERINARIO`.
- `SECRETARIA`.

`Usuario` representa unicamente personal interno autenticable.

`Cliente` representa una entidad administrativa independiente, no autenticable.

---

## Estado actual

Fase 09 implementada como reestructuracion staff-only.

Estado real:

- Auth cliente eliminado del backend y frontend.
- JWT y refresh token reservados para staff.
- `Usuario` quedo como staff autenticable.
- Existe modelo Prisma `Cliente` independiente.
- Mascotas y citas apuntan a `Cliente`.
- Historias clinicas resuelven dueno desde cita/cliente.
- Contacto publico abre WhatsApp y no persiste mensajes con Prisma.
- Selector de veterinarios en citas usa `GET /api/usuarios/veterinarios`.
- El selector de veterinarios en citas usa ids reales del backend mediante select controlado y no debe revertirse.
- Migracion existente: `database/schema/migrations/20260526000000_fase_09_staff_only`.

---

## Validaciones Peru

- DNI: 8 digitos.
- Celular: 9 digitos iniciando en 9.
- Correos validos.

---

## UX/UI

- Responsive.
- Mobile first.
- Dark mode.
- Skeleton loaders.
- Toast notifications.
- Loader global con perrito corriendo.
- Sidebar moderna.
- Diseno premium.

---

## Loader global

Mostrar:

- Perrito corriendo animado.
- Texto: `Cargando sistema...`.

Usar:

- Framer Motion.
- LottieFiles o GIF optimizado.

---

## Reglas globales

- Todo en espanol.
- No subir archivos `.env`.
- Usar Git y GitHub.
- Desarrollar primero en localhost.
- Desplegar despues.
- No ejecutar `npm audit` automaticamente.
- No optimizar dependencias fuera del alcance solicitado.
- No actualizar versiones innecesariamente.
- No modificar fases futuras sin solicitud explicita.
- Mantener foco en la fase actual.

---

## Acceso al sistema

### Staff administrativo

- Login unico para staff.
- Dashboard administrativo.
- Acceso por roles `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- Sin flujo multiportal.

### Clientes administrativos

- No tienen portal.
- No tienen registro publico.
- No tienen autenticacion.
- No tienen password.
- No tienen recuperacion de contrasena.
- Se gestionan solo desde el panel interno por staff autorizado.

---

## Despliegue futuro

Frontend:

- Vercel.

Backend:

- Railway o Render.

Base de datos:

- Supabase PostgreSQL.

---

## Gestion de staff futura

La Fase 10 debe analizar e implementar posteriormente gestion administrativa de staff:

- Veterinarios.
- Secretarias.
- Administradores, segun decision de producto.
- Activacion/inactivacion.
- Control de acceso.
- Creacion y administracion solo por `ADMIN`.
- Auditoria basica de acceso y estado.

Fase 10 no esta implementada todavia.
