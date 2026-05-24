# Flujo IA — VetExpert

# Objetivo

Usar IA de manera modular sin romper arquitectura ni consumir contexto innecesario.

---

# Contexto mínimo para IA

Siempre compartir:

1. project_context.md
2. memory/progreso_actual.md
3. fase actual en task/
4. docs relevantes

---

# Reglas para IA

- NO modificar fases futuras.
- NO actualizar dependencias innecesarias.
- NO ejecutar npm audit automáticamente.
- Mantener arquitectura existente.
- Mantener TypeScript estricto.
- Mantener Clean Architecture.
- NO reestructurar carpetas sin necesidad.

---

# Uso recomendado

## Codex

Usar para:

- CRUD
- DTOs
- Prisma
- componentes
- formularios

## Antigravity

Usar para:

- debugging
- reasoning
- arquitectura
- análisis complejo

## ChatGPT

Usar para:

- planificación
- roadmap
- arquitectura
- UX/UI
- debugging guiado

---

# Estrategia desarrollo

Desarrollar:

- fase por fase
- módulo por módulo

NO desarrollar todo el sistema de golpe.