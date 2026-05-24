# Convenciones — VetExpert

# Reglas generales

- Todo el sistema debe estar en español.
- Usar TypeScript estricto.
- Mantener componentes reutilizables.
- Mantener separación de responsabilidades.
- NO duplicar lógica.
- NO usar any innecesariamente.

---

# Frontend

## Componentes

- Componentes reutilizables en `components/`
- Componentes específicos en `modules/`

## Naming

Componentes:

PascalCase

Ejemplo:

- ClienteModal.tsx
- DashboardShell.tsx

Hooks:

camelCase iniciando con use

Ejemplo:

- useAuth.ts
- useClientes.ts

---

# Backend

## DTOs

Separar:

- crear
- actualizar
- listar

Ejemplo:

- crear-cliente.dto.ts
- actualizar-cliente.dto.ts

## Services

Toda lógica de negocio debe vivir en services.

## Controllers

Los controllers solo deben manejar request/response.

---

# Prisma

- NO usar consultas innecesarias.
- Usar select para optimizar.
- Mantener soft delete.

---

# Validaciones Perú

## DNI

8 dígitos.

## Celular

9 dígitos iniciando en 9.

---

# UX/UI

Mantener:

- responsive
- mobile first
- dark mode
- skeleton loaders
- toast notifications
- loaders elegantes