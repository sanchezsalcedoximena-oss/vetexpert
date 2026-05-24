# Arquitectura — VetExpert

## Tipo de arquitectura

- Clean Architecture
- Monolito modular
- Frontend y backend separados
- Arquitectura escalable
- TypeScript estricto
- Componentes reutilizables

NO usar microservicios.

---

# Frontend

Tecnologías:

- Next.js App Router
- TypeScript
- TailwindCSS
- Framer Motion
- Axios
- TanStack Query
- React Hook Form
- Zod
- Zustand

Estructura:

frontend/src/

- app/
- components/
- modules/
- services/
- hooks/
- lib/
- validators/
- utils/
- constants/
- store/
- types/

---

# Backend

Tecnologías:

- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- BcryptJS

Estructura:

backend/src/

- auth/
- clientes/
- mascotas/
- citas/
- common/
- prisma/

---

# Base de datos

Motor:

- PostgreSQL

ORM:

- Prisma ORM

Schema principal:

database/schema/schema.prisma

---

# Autenticación

Sistema JWT con:

- access token
- refresh token

Roles:

- ADMIN
- VETERINARIO
- SECRETARIA
- CLIENTE

---

# Frontend ↔ Backend

Comunicación mediante Axios.

Backend:

http://localhost:4000/api

Frontend:

http://localhost:3000

---

# Reglas importantes

- Todo en español.
- NO romper fases anteriores.
- Mantener TypeScript estricto.
- Mantener Clean Architecture.
- NO actualizar dependencias innecesariamente.
- NO ejecutar npm audit automáticamente.

## Principios
- Separación responsabilidades
- Componentes reutilizables
- Bajo acoplamiento
- Alta cohesión
- Escalabilidad
- Mantenibilidad