# VetExpert - Contexto Global IA

## Proyecto

VetExpert es un sistema web veterinario profesional administrativo/staff-only.

NO existe portal cliente.

NO existe login cliente.

NO existe registro público cliente.

Los clientes son únicamente registros administrativos internos relacionados con mascotas, citas e historias clínicas.

---

# Stack

Frontend:
- Next.js App Router
- TypeScript estricto
- TailwindCSS
- shadcn/ui
- Framer Motion

Backend:
- NestJS
- Prisma ORM
- PostgreSQL
- JWT

Infraestructura futura:
- GitHub
- Supabase PostgreSQL
- Vercel
- Railway o Render

---

# Arquitectura

- Clean Architecture
- Monolito modular
- Backend/frontend separados
- Componentes reutilizables
- Dark mode
- Responsive
- Diseño premium
- Mobile first

NO usar microservicios.

---

# Roles finales

- ADMIN
- VETERINARIO
- SECRETARIA

Rol eliminado:
- CLIENTE

---

# Estado actual roadmap

Completado:

- Fase 01
- Fase 02 Auth base
- Fase 03 Landing
- Fase 04 Dashboard base
- Fase 04.1 Seed admin
- Fase 05 Clientes
- Fase 06 Mascotas
- Fase 07 Citas
- Fase 08 Historia clínica completa

Historia clínica incluye:
- Prisma
- Backend
- DTOs
- Endpoints
- Timeline UI
- Integración con citas completadas

---

# Próxima fase

## Fase 09

Reestructuración auth/roles staff-only.

Objetivos:
- eliminar auth cliente
- eliminar portal cliente
- eliminar registro cliente
- eliminar recuperación cliente
- retirar CLIENTE del flujo auth
- mantener clientes como entidad administrativa
- preparar gestión de staff

---

# Fases futuras

## Fase 10
Gestión de staff:
- veterinarios
- secretarias
- activación/inactivación
- permisos admin

## Fase 11
Correcciones UX/UI:
- validaciones login
- icono ojo contraseña
- selector veterinarios citas
- limpieza auth

## Fase 12
Dashboard dinámico.

## Fase 13
Reportes.

## Fase 14
Configuración.

## Fase 15
Mantenimiento futuro.

---

# Reglas IA

- NO ejecutar npm audit automáticamente
- NO actualizar dependencias innecesariamente
- NO modificar fases futuras
- Mantener TypeScript estricto
- Mantener arquitectura actual
- Mantener diseño premium
- Mantener dark mode
- Mantener responsive
- Mantener patrones existentes

---

# Flujo actual importante

Una mascota puede tener múltiples citas.

Cada cita COMPLETADA puede generar máximo una HistoriaClinica.

La historia clínica:
- deriva mascotaId desde cita
- deriva veterinarioId desde cita
- puede cerrarse
- solo ADMIN puede reabrirla

---

# UX/UI importante

En citas:
- selector veterinario debe funcionar como combobox searchable igual que clientes

Login:
- mejorar validaciones visuales
- corregir icono ojo contraseña

Clientes:
- ya NO usan contraseña
- ya NO tendrán acceso al sistema

Staff:
- solo ADMIN crea veterinarios y secretarias