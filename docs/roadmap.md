# Roadmap - VetExpert

## Alcance Actual Confirmado

VetExpert será un sistema web exclusivamente administrativo para staff veterinario.

Roles activos finales:

* `ADMIN`
* `VETERINARIO`
* `SECRETARIA`

Fuera de alcance:

* Portal cliente.
* Login cliente.
* Registro público cliente.
* Autenticación cliente.
* Recuperación cliente.
* Flujo multiportal.

Los clientes se conservan como registros administrativos internos: dueños de mascotas, contacto, relación con citas e historia clínica.

---

## Completado

## Fase 01

Arquitectura base.

## Fase 02

Autenticación inicial.

Nota: contiene piezas heredadas de cliente autenticado que deben retirarse en la fase de reestructuración.

## Fase 03

Landing page.

## Fase 04

Dashboard base.

## Fase 04.1

Seed admin inicial.

## Fase 05

Gestión clientes.

Nota: actualmente clientes están modelados sobre `Usuario` tipo `CLIENTE`; se debe refactorizar para dejarlos como entidad administrativa no autenticable.

## Fase 06

Gestión mascotas.

## Fase 07

Gestión citas.

## Fase 08

Historia clínica.

Subfases completadas:

* Fase 08.1 - Prisma historia clínica.
* Fase 08.2 - Backend módulo historia clínica.
* Fase 08.3 - Endpoints historia clínica.
* Fase 08.4 - Frontend services historia clínica.
* Fase 08.5 - Timeline UI historia clínica.
* Fase 08.6 - Integración con citas completadas.
* Fase 08.7 - Refinamiento y estabilización.

---

## Próxima Fase Obligatoria

## Fase 09 - Reestructuración auth/roles y alcance staff-only

Objetivo:

* Eliminar el flujo de cliente autenticado.
* Consolidar roles finales `ADMIN`, `VETERINARIO`, `SECRETARIA`.
* Mantener clientes como registros administrativos internos.
* Limpiar backend, frontend, rutas, guards, services y documentación.
* Preparar la base para gestión de staff.

Alcance técnico:

* Retirar endpoints de login/registro cliente.
* Retirar pantallas públicas de portal cliente.
* Eliminar `CLIENTE` del flujo de sesión y navegación.
* Revisar Prisma para separar o desactivar la semántica de usuario cliente.
* Mantener relaciones con mascotas, citas e historia clínica durante la migración.
* Ajustar seeds y validaciones.

---

## Fases Pendientes Reordenadas

## Fase 10 - Gestión de Staff

Gestión administrativa para:

* Veterinarios.
* Secretarias.
* Activación/inactivación.
* Control de acceso.
* Creación y edición solo por `ADMIN`.

## Fase 11 - Correcciones UX/UI y limpieza operativa

Incluye:

* Validaciones visuales de login.
* Alineación del icono de ojo en contraseña.
* Selector de veterinarios en citas.
* Limpieza de auth innecesaria.
* Revisión responsive y accesibilidad básica.

## Fase 12 - Dashboard dinámico

Dashboard con información operativa real:

* Citas del día.
* Pacientes recientes.
* Historias pendientes/abiertas.
* Indicadores administrativos.

## Fase 13 - Reportes

Reportes internos para staff y administración.

## Fase 14 - Configuración

Configuración de clínica, parámetros operativos y catálogos.

## Fase 15 - Mantenimiento Futuro

Tareas de mantenimiento, auditoría, optimización y hardening.
