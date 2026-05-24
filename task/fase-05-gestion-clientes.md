# Fase 05 — Gestión de Clientes

## Objetivo

Implementar modulo profesional de gestion de clientes veterinarios.

---

## Backend

### Endpoints
- GET /api/clientes
- GET /api/clientes/:id
- POST /api/clientes
- PATCH /api/clientes/:id
- DELETE /api/clientes/:id

### Funcionalidades
- paginacion
- busqueda
- filtros
- soft delete
- validaciones Peru
- DTOs
- guards JWT
- roles permitidos:
  - ADMIN
  - SECRETARIA

---

## Frontend

### Rutas
- /dashboard/clientes
- /dashboard/clientes/nuevo
- /dashboard/clientes/[id]

### Funcionalidades
- tabla responsive
- buscador
- filtros
- paginacion
- crear cliente
- editar cliente
- eliminar cliente
- drawer/modal detalle
- estados vacios
- skeleton loaders
- toast notifications

---

## UX/UI

### Requisitos
- diseño premium
- responsive
- dark mode
- Framer Motion
- tablas modernas
- formularios modernos
- loaders elegantes

---

## Datos Cliente

### Campos
- nombres
- apellidos
- DNI
- celular
- correo
- direccion
- estado activo

---

## Reglas

- NO romper autenticacion existente.
- Mantener Clean Architecture.
- Mantener TypeScript estricto.
- NO modificar fases futuras.
- NO ejecutar npm audit.
- NO actualizar dependencias innecesarias.

---

## Checklist

- CRUD clientes funcionando
- tabla responsive
- paginacion funcionando
- filtros funcionando
- soft delete funcionando
- frontend conectado backend
- guards funcionando
- dark mode funcionando

---

## Validaciones
- DNI Perú
- celular Perú