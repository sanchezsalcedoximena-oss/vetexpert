# Fase 04 — Acceso y Dashboard Base

## Objetivo
Implementar flujo visual completo de autenticación y estructura inicial del sistema interno VetExpert.

---

## Alcance

### Staff
- Login visual profesional
- JWT funcionando
- Persistencia sesión
- Logout
- Guards frontend
- Redirecciones por rol

### Cliente
- Login cliente
- Portal cliente base
- Registro conectado al backend
- Recuperación contraseña visual

---

## Dashboard Base

### Layout
- Sidebar moderna
- Header
- Avatar usuario
- Breadcrumbs
- Responsive
- Dark mode

### Roles
- ADMIN
- VETERINARIO
- SECRETARIA
- CLIENTE

---

## UX/UI

### Requisitos
- Diseño premium
- Framer Motion
- Skeleton loaders
- Loader global
- Transiciones suaves
- Toast notifications
- Formularios modernos

---

## Frontend

## Rutas esperadas

### Públicas
- /
- /staff/login
- /portal/login
- /portal/registro

### Privadas
- /dashboard
- /dashboard/clientes
- /dashboard/mascotas
- /dashboard/citas

---

## Backend

## Validaciones
- JWT Guards
- Roles Guards
- Refresh token funcional
- Perfil usuario autenticado

---

## Integraciones

### Frontend ↔ Backend
- Axios configurado
- Interceptors JWT
- Manejo expiración token
- Refresh automático

---

## Checklist

- login staff funcionando
- login cliente funcionando
- dashboard renderizando
- guards funcionando
- sidebar moderna
- sesión persistente
- logout funcionando
- rutas protegidas