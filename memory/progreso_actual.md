# Progreso Actual - VetExpert

## Estado general

Proyecto funcionando en entorno local con arquitectura administrativa/staff-only consolidada.

VetExpert ya no contempla clientes autenticados. El sistema queda reservado para personal interno.

---

## Alcance confirmado

Roles activos finales:

- `ADMIN`
- `VETERINARIO`
- `SECRETARIA`

No existe:

- `Rol.CLIENTE`.
- `TipoUsuario`.
- Login cliente.
- Registro publico cliente.
- Portal cliente funcional.
- Auth cliente.
- JWT cliente.
- Refresh token cliente.
- Cliente como `Usuario` autenticable.

Los clientes existen unicamente como registros administrativos internos. Representan duenos de mascotas, datos de contacto y relaciones operativas con mascotas, citas e historias clinicas.

---

## Estado Fase 09

Fase 09 staff-only ya quedo implementada y documentada.

Documentos principales:

- `docs/fase-09-analisis.md`: contrato tecnico original de reestructuracion.
- `docs/fase-09-implementacion.md`: estado real implementado.

Resultado real:

- `Usuario` representa solo personal interno autenticable.
- `Cliente` es entidad administrativa independiente.
- Prisma ya no contiene `TipoUsuario`.
- Prisma ya no contiene `Rol.CLIENTE`.
- Mascotas apuntan a `Cliente`.
- Citas apuntan a `Cliente`.
- Historias clinicas resuelven dueno desde `cita.cliente`.
- Contacto publico abre WhatsApp y no persiste mensajes con Prisma.
- Auth staff usa correo/password, JWT access token y refresh token interno.

Migracion existente:

- `database/schema/migrations/20260526000000_fase_09_staff_only`

---

## Backend

Implementado:

- NestJS funcionando.
- Prisma ORM configurado.
- PostgreSQL conectado.
- Migraciones funcionando.
- Prisma Client generado.
- API en puerto 4000.
- Seed admin inicial implementado.
- Auth staff JWT.
- Refresh token staff.
- Recuperacion de contrasena filtrada a staff, con flujo de entrega/consumo pendiente.
- Guards JWT y roles.
- Modulo clientes sobre `Cliente` administrativo.
- Modulo mascotas protegido.
- Modulo citas protegido.
- Modulo historias clinicas protegido.
- Endpoint `GET /api/usuarios/veterinarios` para selects internos.

Auth cliente fue retirado del contrato funcional.

---

## Frontend

Implementado:

- Next.js App Router.
- TailwindCSS.
- Landing publica funcional.
- Frontend conectado al backend.
- Dashboard protegido.
- Sidebar moderna responsive.
- Dark mode.
- Gestion de clientes en `/dashboard/clientes`.
- Gestion de mascotas en `/dashboard/mascotas`.
- Gestion de citas en `/dashboard/citas`.
- Login staff en `/staff/login`.
- `/login` renderiza acceso staff.
- Contacto publico via WhatsApp.

No existe flujo frontend funcional de portal cliente.

Observacion real:

- Existen carpetas vacias `frontend/src/app/portal` y `frontend/src/app/registro`.
- No contienen `page.tsx`, por lo tanto no exponen rutas funcionales.

---

## Correccion selector de veterinarios en citas

El bug del selector de veterinarios en citas quedo resuelto.

Estado real:

- El backend expone `GET /api/usuarios/veterinarios`.
- El frontend consume ese endpoint mediante `frontend/src/services/usuarios.ts`.
- `CitasPage` carga veterinarios reales del backend.
- El selector usa ids reales de usuarios con rol `VETERINARIO`.
- El formulario usa select controlado para mantener sincronizado el `veterinarioId`.
- La correccion ya funciona en frontend y no debe revertirse.

Esta correccion es una precondicion importante para Fase 10: la futura gestion de staff no debe romper el contrato de veterinarios usado por citas.

---

## Autenticacion implementada

Implementado:

- `POST /api/auth/staff/login`.
- `POST /api/auth/refresh`.
- `GET /api/auth/perfil`.
- `POST /api/auth/recuperar` filtrado a staff.
- Hash con bcryptjs.
- Persistencia JWT frontend.
- Interceptor Axios con refresh automatico.
- Logout frontend.

Reglas actuales:

- Solo staff puede autenticarse.
- JWT no incluye `tipoUsuario`.
- Refresh token solo pertenece a `Usuario` staff activo.
- Clientes administrativos no tienen password ni sesion.

Deuda residual:

- Completar flujo real de recuperacion staff si se requiere envio/consumo del token.
- Endurecer proxy si se decide validar rol desde middleware, no solo presencia de token.

---

## Landing publica

Implementado:

- Hero section.
- Servicios.
- Promociones.
- Sobre nosotros.
- Contacto.
- Footer.
- WhatsApp flotante.
- Formulario visual de contacto.

Estado real del contacto:

- El formulario no llama a `/api/contacto/mensajes`.
- No crea `Cliente`.
- No crea `Usuario`.
- No usa Prisma.
- Construye URL de WhatsApp con los campos del formulario.

---

## Dashboard base

Implementado:

- Ruta `/dashboard` protegida.
- Rutas protegidas `/dashboard/clientes`, `/dashboard/mascotas`, `/dashboard/citas`.
- Layout interno con sidebar, header, avatar y breadcrumbs.
- Dark mode persistente.
- Vista responsive mobile/desktop.
- Logout funcional.
- Navegacion limitada a `ADMIN`, `SECRETARIA`, `VETERINARIO`.

No hay navegacion ni permisos para `CLIENTE`.

---

## Seed admin inicial

Implementado:

- Script `npm run prisma:seed`.
- Usuario `admin@vetexpert.com`.
- Password inicial `Admin123*`.
- Rol `ADMIN`.
- Password hasheado con bcryptjs.
- Seed idempotente.

---

## Gestion clientes

Estado real:

- Clientes ya no son usuarios autenticables.
- Clientes se guardan en tabla/modelo `Cliente`.
- No tienen password.
- No tienen rol.
- No tienen `tipoUsuario`.
- No reciben JWT.

Backend:

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PATCH /api/clientes/:id`
- `DELETE /api/clientes/:id`
- Paginacion.
- Busqueda.
- Filtros por estado.
- Soft delete.
- Guards JWT.
- Roles `ADMIN`, `SECRETARIA`.

Frontend:

- `/dashboard/clientes`.
- Tabla responsive.
- Buscador.
- Filtros.
- Paginacion.
- Crear cliente.
- Editar cliente.
- Eliminar cliente.
- Modal detalle.
- Skeleton loaders.
- Toast notifications.

---

## Gestion mascotas

Backend:

- `GET /api/mascotas`
- `GET /api/mascotas/:id`
- `POST /api/mascotas`
- `PATCH /api/mascotas/:id`
- `DELETE /api/mascotas/:id`
- Paginacion.
- Busqueda por mascota, raza y datos del cliente administrativo.
- Filtros por especie, estado y `clienteId`.
- Soft delete.
- Validacion de `clienteId` contra `Cliente` activo y no eliminado.
- Guards JWT.
- Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

- `/dashboard/mascotas`.
- Tabla responsive en desktop y tarjetas en mobile.
- Buscador debounceado.
- Filtros por estado y especie.
- Paginacion.
- Modal de crear y editar.
- Selector de dueno consumiendo `/api/clientes`.
- Calculo visual de edad.
- Drawer lateral con detalle de mascota y dueno.
- Toasts.
- Skeleton loaders.
- Confirmacion de borrado.

---

## Gestion citas

Backend:

- `GET /api/citas`
- `GET /api/citas/:id`
- `POST /api/citas`
- `PATCH /api/citas/:id`
- `DELETE /api/citas/:id`
- Paginacion.
- Busqueda en motivo, observaciones, mascota, cliente y veterinario.
- Filtros por estado, veterinario, cliente, mascota y rango de fechas.
- Estados `PENDIENTE`, `CONFIRMADA`, `COMPLETADA`, `CANCELADA`.
- Soft delete mediante `eliminadoEn`.
- Validacion de fecha no pasada.
- Validacion de mascota activa y no eliminada.
- Validacion de veterinario como `Usuario` activo con rol `VETERINARIO`.
- Asociacion automatica de `clienteId` desde la mascota.
- Prevencion de doble booking exacto por `veterinarioId + fecha`.
- Guards JWT.
- Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

- `/dashboard/citas`.
- Service `frontend/src/services/citas.ts`.
- Service `frontend/src/services/usuarios.ts` para veterinarios.
- Tipo `Cita` con resumen `historiaClinica`.
- Tabla responsive en desktop y tarjetas en mobile.
- Filtros por busqueda, estado, veterinario y rango de fechas.
- Paginacion.
- Modal de crear y editar cita.
- Selector dependiente cliente -> mascotas activas del cliente.
- Selector de veterinario corregido con ids reales desde backend.
- Select controlado para `veterinarioId`.
- Drawer lateral con detalle completo de cita, paciente, dueno y veterinario.
- Badges visuales para estados.
- Accion contextual en citas `COMPLETADA`: crear historia clinica o ver historia existente.
- Modal de historia clinica integrado desde citas completadas.
- Drawer de detalle de historia clinica integrado.
- Toasts.
- Skeleton loaders.
- Confirmacion de borrado.

---

## Historia clinica

Backend:

- Modelo Prisma `HistoriaClinica`.
- Migracion `20260525151556_fase_08_historia_clinica`.
- Modulo `HistoriasClinicasModule`.
- Service con reglas de negocio.
- DTOs de creacion, actualizacion y listado.
- Controller REST completo.
- `GET /api/historias-clinicas`
- `GET /api/historias-clinicas/:id`
- `GET /api/historias-clinicas/mascota/:mascotaId`
- `POST /api/historias-clinicas/cita/:citaId`
- `PATCH /api/historias-clinicas/:id`
- `PATCH /api/historias-clinicas/:id/cerrar`
- `PATCH /api/historias-clinicas/:id/reabrir`
- `DELETE /api/historias-clinicas/:id`
- Creacion solo desde citas `COMPLETADA`.
- Una historia clinica por cita.
- Derivacion automatica de `mascotaId` y `veterinarioId`.
- Validacion de mascota activa.
- Validacion de veterinario como `Usuario` con rol `VETERINARIO`.
- Bloqueo de edicion si `cerrada = true`.
- Reapertura solo por `ADMIN`.
- Soft delete.
- Guards JWT.
- Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

- Service `frontend/src/services/historias-clinicas.ts`.
- Tipos de historia clinica y respuestas.
- Timeline clinico integrado en detalle de mascota.
- Modal reutilizable de creacion/edicion.
- Drawer de detalle.
- Badges `Abierta`/`Cerrada`.
- Skeleton loaders, empty state, loading states y toast notifications.
- Permisos UI: `SECRETARIA` lectura, `VETERINARIO` edita/cierra historias abiertas, `ADMIN` puede reabrir.
- Integracion desde citas completadas.

---

## Prisma

Schema:

```text
database/schema/schema.prisma
```

Migraciones existentes:

- `20260524000000_fase_02_auth`
- `20260524010000_fase_03_landing_contacto`
- `20260524020000_fase_05_clientes`
- `20260525001051_fase_06_mascotas`
- `20260525024949_fase_07_citas`
- `20260525151556_fase_08_historia_clinica`
- `20260526000000_fase_09_staff_only`

Modelo final relevante:

- `Usuario`: staff autenticable.
- `Cliente`: registro administrativo independiente.
- `Mascota`: pertenece a `Cliente`.
- `Cita`: pertenece a `Cliente`, `Mascota` y `Usuario` veterinario.
- `HistoriaClinica`: pertenece a cita, mascota y usuario veterinario.

---

## Endpoints activos principales

Auth:

- `GET /api/auth/estado`
- `POST /api/auth/staff/login`
- `POST /api/auth/refresh`
- `POST /api/auth/recuperar`
- `GET /api/auth/perfil`

Usuarios:

- `GET /api/usuarios/estado`
- `GET /api/usuarios/veterinarios`

Clientes:

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PATCH /api/clientes/:id`
- `DELETE /api/clientes/:id`

Mascotas:

- `GET /api/mascotas`
- `GET /api/mascotas/:id`
- `POST /api/mascotas`
- `PATCH /api/mascotas/:id`
- `DELETE /api/mascotas/:id`

Citas:

- `GET /api/citas`
- `GET /api/citas/:id`
- `POST /api/citas`
- `PATCH /api/citas/:id`
- `DELETE /api/citas/:id`

Historias clinicas:

- `GET /api/historias-clinicas`
- `GET /api/historias-clinicas/:id`
- `GET /api/historias-clinicas/mascota/:mascotaId`
- `POST /api/historias-clinicas/cita/:citaId`
- `PATCH /api/historias-clinicas/:id`
- `PATCH /api/historias-clinicas/:id/cerrar`
- `PATCH /api/historias-clinicas/:id/reabrir`
- `DELETE /api/historias-clinicas/:id`

No activos en contrato actual:

- `POST /api/auth/clientes/login`
- `POST /api/auth/clientes/registro`
- `POST /api/contacto/mensajes`
- `POST /api/auth/staff/google`

---

## Estado roadmap

Completado:

- Fase 01.
- Fase 02 - Autenticacion base.
- Fase 03 - Landing Page.
- Fase 04 - Acceso y Dashboard Base.
- Fase 04.1 - Seed Admin Inicial.
- Fase 05 - Gestion clientes.
- Fase 06 - Mascotas.
- Fase 07 - Citas.
- Fase 08.1 - Prisma historia clinica.
- Fase 08.2 - Backend modulo historia clinica.
- Fase 08.3 - Endpoints historia clinica.
- Fase 08.4 - Frontend services historia clinica.
- Fase 08.5 - Timeline UI historia clinica.
- Fase 08.6 - Integracion historia clinica desde citas completadas.
- Fase 08.7 - Refinamiento y estabilizacion historia clinica.
- Fase 09 - Reestructuracion auth/roles staff-only.
- Sincronizacion documental de Fase 09.
- Correccion del selector de veterinarios en citas.

Proxima fase funcional:

- Fase 10 - Gestion de staff.

Estado Fase 10:

- Solo esta analizada en `docs/fase-10-analisis.md`.
- Todavia no esta implementada.
- No se han creado migraciones de Fase 10.

---

## Fases futuras

- Fase 10 - Gestion de staff.
- Fase 11 - Correcciones UX/UI y limpieza operativa.
- Fase 12 - Dashboard dinamico.
- Fase 13 - Reportes.
- Fase 14 - Configuracion.
- Fase 15 - Mantenimiento futuro.

---

## Riesgos pendientes

- Validar manualmente migracion Fase 09 con datos reales antes de produccion.
- Confirmar integridad de relaciones `clienteId` en mascotas y citas tras migrar.
- Completar flujo operativo de recuperacion de contrasena staff.
- Endurecer proxy si se requiere validacion de rol en middleware.
- No romper `GET /api/usuarios/veterinarios` al implementar CRUD staff.
- Definir si Fase 10 permite crear otros `ADMIN`.
- Evitar inactivar o degradar el ultimo `ADMIN` activo.
- Revocar refresh tokens al inactivar staff en Fase 10.

---

## Estado listo para iniciar Fase 10

La documentacion operativa queda alineada con el estado real actual:

- Arquitectura staff-only consolidada.
- `Usuario` reservado para staff autenticable.
- `Cliente` separado como entidad administrativa.
- Auth cliente eliminado del contrato vigente.
- Citas usa veterinarios reales desde `GET /api/usuarios/veterinarios`.
- Selector de veterinarios en frontend funciona con select controlado.
- Fase 09 implementada y documentada.
- Fase 10 analizada, pero no implementada.

Riesgos a tener presentes al iniciar Fase 10:

- Proteger todo CRUD staff con `ADMIN`.
- Mantener selector de veterinarios compatible con citas.
- No mezclar `Cliente` administrativo con `Usuario` staff.
- Evitar bloqueo del sistema por inactivar/degradar administradores.
- Revocar sesiones activas al inactivar staff.

Siguiente paso recomendado:

- Iniciar implementacion real de Fase 10 tomando `docs/fase-10-analisis.md` como contrato inicial y preservando el endpoint `GET /api/usuarios/veterinarios` usado por citas.
