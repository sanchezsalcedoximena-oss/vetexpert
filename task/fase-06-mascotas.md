# Fase 06 — Gestión de Mascotas

## Objetivo

Implementar modulo profesional de gestion de mascotas veterinarias.

---

# Backend

## Endpoints

- GET /api/mascotas
- GET /api/mascotas/:id
- POST /api/mascotas
- PATCH /api/mascotas/:id
- DELETE /api/mascotas/:id

---

## Funcionalidades

- paginacion
- busqueda
- filtros
- soft delete
- relacion con cliente
- subida futura de foto
- DTOs
- guards JWT

---

## Roles permitidos

- ADMIN
- SECRETARIA
- VETERINARIO

---

# Frontend

## Rutas

- /dashboard/mascotas
- /dashboard/mascotas/nuevo
- /dashboard/mascotas/[id]

---

## Funcionalidades

- tabla responsive
- buscador
- filtros
- paginacion
- crear mascota
- editar mascota
- eliminar mascota
- drawer/modal detalle
- skeleton loaders
- toast notifications

---

# Datos mascota

## Campos

- nombre
- especie
- raza
- sexo
- edad
- peso
- color
- esterilizado
- alergias
- observaciones
- clienteId
- activo

---

# Validaciones

## Peso

Mayor a 0.

## Edad

Mayor o igual a 0.

---

# UX/UI

- diseño premium
- responsive
- dark mode
- Framer Motion
- tablas modernas
- formularios modernos

---

# Reglas

- NO romper autenticacion existente.
- Mantener Clean Architecture.
- Mantener TypeScript estricto.
- NO modificar fases futuras.
- NO actualizar dependencias innecesarias.

---

# Checklist

- CRUD mascotas funcionando
- tabla responsive
- paginacion funcionando
- filtros funcionando
- soft delete funcionando
- frontend conectado backend
- guards funcionando
- dark mode funcionando