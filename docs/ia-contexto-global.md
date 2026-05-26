# VetExpert - Contexto Global IA

## Proyecto

VetExpert es un sistema web veterinario profesional administrativo/staff-only.

No existe portal cliente, login cliente ni registro publico cliente.

Los clientes son registros administrativos internos relacionados con mascotas, citas e historias clinicas. No son usuarios autenticables.

---

## Stack

Frontend:

- Next.js App Router.
- TypeScript estricto.
- TailwindCSS.
- shadcn/ui.
- Framer Motion.

Backend:

- NestJS.
- Prisma ORM.
- PostgreSQL.
- JWT.

Infraestructura futura:

- GitHub.
- Supabase PostgreSQL.
- Vercel.
- Railway o Render.

---

## Arquitectura

- Clean Architecture.
- Monolito modular.
- Backend/frontend separados.
- Componentes reutilizables.
- Dark mode.
- Responsive.
- Diseno premium.
- Mobile first.

No usar microservicios.

---

## Roles finales

- `ADMIN`.
- `VETERINARIO`.
- `SECRETARIA`.

No existe `Rol.CLIENTE`.

No existe `TipoUsuario`.

---

## Modelo de identidad final

`Usuario`:

- Personal interno autenticable.
- Tiene correo, password hash, rol, refresh tokens y recuperaciones de clave staff.
- Puede actuar como veterinario responsable en citas e historias clinicas.

`Cliente`:

- Entidad administrativa independiente.
- No tiene password.
- No tiene JWT.
- No tiene refresh token.
- No inicia sesion.
- Es dueno de mascotas y se relaciona con citas e historias clinicas.

---

## Estado actual roadmap

Completado:

- Fase 01.
- Fase 02 Auth base.
- Fase 03 Landing.
- Fase 04 Dashboard base.
- Fase 04.1 Seed admin.
- Fase 05 Clientes.
- Fase 06 Mascotas.
- Fase 07 Citas.
- Fase 08 Historia clinica completa.
- Fase 09 Reestructuracion staff-only.
- Fase 10 Gestion administrativa de staff.
- Fase 11 UX/UI y limpieza operativa.

Fase 09 dejo implementado:

- Eliminacion de auth cliente.
- Eliminacion de `TipoUsuario`.
- Eliminacion de `Rol.CLIENTE`.
- Modelo Prisma `Cliente`.
- `Usuario` reservado para staff.
- Contacto publico via WhatsApp.
- Endpoint `GET /api/usuarios/veterinarios`.
- Selector de veterinarios en citas corregido con ids reales y select controlado.

---

## Fases actuales documentadas

Fase 09:

- Contrato tecnico: `docs/fase-09-analisis.md`.
- Resultado implementado: `docs/fase-09-implementacion.md`.

Fase 10:

- Analisis: `docs/fase-10-analisis.md`.
- Resultado implementado: `docs/fase-10-implementacion.md`.

Fase 11:

- Analisis: `docs/fase-11-analisis.md`.
- Resultado implementado: `docs/fase-11-implementacion.md`.

---

## Proxima fase

Fase 12 - Dashboard dinamico.

Objetivo futuro:

- Mostrar metricas operativas reales.
- Reutilizar endpoints existentes o definir endpoints agregados acotados.
- Mantener intactos CRUD, citas, historias clinicas y staff.
- Preservar arquitectura staff-only.

---

## Fases futuras

Fase 12:

- Dashboard dinamico.

Fase 13:

- Reportes.

Fase 14:

- Configuracion.

Fase 15:

- Mantenimiento futuro.

---

## Reglas IA

- No ejecutar `npm audit` automaticamente.
- No actualizar dependencias innecesariamente.
- No modificar fases futuras sin solicitud explicita.
- Mantener TypeScript estricto.
- Mantener arquitectura actual.
- Mantener diseno premium.
- Mantener dark mode.
- Mantener responsive.
- Mantener patrones existentes.
- No inventar funcionalidades no implementadas.

---

## Flujos actuales importantes

- Una mascota pertenece a un cliente administrativo.
- Una mascota puede tener multiples citas.
- Una cita deriva `clienteId` desde la mascota.
- Una cita tiene un veterinario staff asociado.
- Cada cita `COMPLETADA` puede generar maximo una historia clinica.
- La historia clinica deriva `mascotaId` y `veterinarioId` desde la cita.
- La historia clinica puede cerrarse.
- Solo `ADMIN` puede reabrir historias clinicas.

---

## UX/UI importante

Citas:

- Selector de veterinario usa ids reales desde `GET /api/usuarios/veterinarios`.
- No revertir el selector controlado de veterinarios en citas.

Login:

- Es staff-only.
- Usa `/staff/login` como ruta principal.

Clientes:

- No usan contrasena.
- No tienen acceso al sistema.

Staff:

- La gestion administrativa completa fue implementada en Fase 10.
- Solo `ADMIN` puede crear, editar, activar o inactivar staff.
- No romper hardening de ultimo `ADMIN` activo.

UX/UI:

- Fase 11 implemento `TableSkeleton`, `EmptyState`, loading buttons, mejoras de accesibilidad en `Input`, wrapping de textos largos, toasts mobile, overflow horizontal controlado, textarea resize vertical, responsive y dark mode refinados.
