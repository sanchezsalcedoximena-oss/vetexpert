# Decisiones Técnicas — VetExpert

# Arquitectura

Se eligió:

- Clean Architecture
- Monolito modular

Motivo:

- simplicidad
- mantenibilidad
- escalabilidad

---

# Frontend

Se usa Next.js App Router por:

- SSR
- escalabilidad
- routing moderno

---

# Backend

Se usa NestJS por:

- arquitectura modular
- escalabilidad
- TypeScript nativo
- Guards y decorators

---

# ORM

Se usa Prisma ORM por:

- tipado fuerte
- migraciones
- integración TypeScript
- productividad

---

# Base de datos

Se usa PostgreSQL por:

- robustez
- relaciones complejas
- escalabilidad

---

# Seguridad

Se usa:

- JWT
- RBAC
- bcryptjs
- guards

---

# Soft delete

Clientes eliminados NO se borran físicamente.

Se usa:

eliminadoEn

para auditoría y recuperación futura.