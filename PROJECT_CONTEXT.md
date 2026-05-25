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

Rol eliminado del acceso al sistema:
- Cliente

Los clientes existen solo como registros administrativos internos: dueños de mascotas, datos de contacto, historial de atención y trazabilidad operativa. No tienen login, portal, JWT ni cuenta de usuario.

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

## Reglas para IA

- NO ejecutar npm audit automáticamente.
- NO optimizar dependencias fuera del alcance solicitado.
- NO actualizar versiones innecesariamente.
- NO modificar fases futuras.
- Mantener foco únicamente en la fase actual.

## Acceso al Sistema

### Staff administrativo
- Login único para staff.
- Dashboard administrativo.
- Acceso por roles `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- Sin flujo multiportal.

### Clientes administrativos
- No tienen portal.
- No tienen registro público.
- No tienen autenticación.
- No tienen recuperación de contraseña.
- Se gestionan únicamente desde el panel interno por el staff autorizado.

## Cambio de Alcance Confirmado

VetExpert queda definido como un sistema exclusivamente administrativo/staff.

Se elimina del alcance:
- Portal cliente.
- Login cliente.
- Registro público de cliente.
- Autenticación cliente.
- Recuperación cliente.
- Acceso cliente.
- Flujo multiportal.

Se conserva:
- Gestión administrativa de clientes como dueños de mascotas.
- Gestión de mascotas.
- Gestión de citas.
- Historia clínica.
- Dashboard interno.
- Reportes internos futuros.
- Configuración y mantenimiento administrativo.

## Gestión de Staff Futuro

Debe incorporarse una gestión administrativa de usuarios staff:
- Veterinarios.
- Secretarias.
- Administradores según necesidad.
- Activación/inactivación.
- Control de acceso.
- Creación y administración solo por `ADMIN`.
- Auditoría básica de acceso y estado.

## Reestructuración Pendiente

Antes de avanzar nuevas fases funcionales se debe ejecutar una fase de reestructuración:
- Eliminar endpoints y pantallas de cliente autenticado.
- Retirar rutas públicas `/portal/*`, `/registro`, `/login` cliente y recuperación cliente si queda orientada a cliente.
- Refactorizar clientes para dejar de depender de `rol: CLIENTE` como usuario autenticable.
- Mantener compatibilidad de relaciones actuales hasta definir migración de datos segura.
- Ajustar navegación y guards a roles finales staff.
- Limpiar services frontend y auth store de tipos cliente.
