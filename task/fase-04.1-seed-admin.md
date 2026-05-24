# Fase 04.1 — Seed Admin Inicial

## Objetivo

Implementar seed inicial Prisma para crear usuario administrador por defecto.

---

## Backend

### Requisitos

- crear script seed prisma
- crear admin inicial
- password hasheado bcrypt
- evitar duplicados
- usar variables entorno si aplica

---

## Usuario inicial

### Datos

correo:
admin@vetexpert.com

password:
Admin123*

rol:
ADMIN

---

## Validaciones

- no duplicar usuario
- mostrar logs claros
- compatible Prisma ORM

---

## Scripts

Agregar scripts:

- npm run prisma:seed

---

## Reglas

- NO romper autenticacion existente.
- NO modificar fases futuras.
- Mantener TypeScript estricto.