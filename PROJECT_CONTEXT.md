# VetExpert — Contexto General del Proyecto

## Arquitectura
- Clean Architecture
- Monolito modular
- TypeScript estricto
- Componentes reutilizables
- Código mantenible
- Arquitectura escalable

NO usar microservicios.

---

## Roles del Sistema
- Administrador
- Veterinario
- Secretaria
- Cliente

---

## Validaciones Perú
- DNI: 8 dígitos
- Celular: 9 dígitos iniciando en 9
- Correos válidos

---

## UX/UI
- Responsive
- Mobile first
- Dark mode
- Skeleton loaders
- Toast notifications
- Loader global con perrito corriendo
- Sidebar moderna
- Diseño premium

---

## Loader Global
Mostrar:
- Perrito corriendo animado
- Texto: “Cargando sistema...”

Usar:
- Framer Motion
- LottieFiles o GIF optimizado

---

## Reglas Globales
- Todo en español.
- NO subir archivos .env.
- Usar Git y GitHub.
- Desarrollar primero en localhost.
- Desplegar después.

---

## Despliegue Futuro
Frontend:
- Vercel

Backend:
- Railway o Render

Base de datos:
- Supabase PostgreSQL