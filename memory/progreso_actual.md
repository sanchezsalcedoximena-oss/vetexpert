# Progreso Actual - VetExpert

## Estado General

Proyecto funcionando correctamente en entorno local.

## Backend

* NestJS funcionando.
* Prisma ORM configurado.
* PostgreSQL conectado.
* Migraciones funcionando.
* Prisma Client generado correctamente.
* API funcionando en puerto 4000.
* Seed admin inicial implementado y probado.
* Modulo clientes implementado con CRUD protegido.
* Modulo mascotas implementado con CRUD protegido.
* Modulo citas implementado con CRUD protegido.
* Modulo historias clinicas implementado en backend hasta endpoints REST.

## Frontend

* Next.js funcionando.
* TailwindCSS configurado.
* Landing publica funcional.
* Frontend conectado correctamente al backend.
* Dashboard base protegido funcionando.
* Sidebar moderna responsive implementada.
* Dark mode disponible en acceso y dashboard.
* Gestion de clientes funcional en `/dashboard/clientes`.
* Gestion de mascotas funcional en `/dashboard/mascotas`.
* Gestion de citas funcional en `/dashboard/citas`.

## Autenticacion implementada

* Login staff JWT.
* Login cliente JWT.
* Refresh token.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`, `CLIENTE`.
* Registro cliente.
* Recuperacion de contrasena preparada.
* Guards JWT backend.
* Guards frontend para rutas privadas.
* Hash bcryptjs.
* Persistencia JWT frontend.
* Interceptor Axios con refresh automatico.
* Logout frontend.

## Landing Page implementada

* Hero section.
* Servicios.
* Promociones.
* Sobre nosotros.
* Contacto.
* Footer.
* WhatsApp flotante.
* Formulario contacto funcional.
* Persistencia mensajes PostgreSQL.

## Dashboard Base implementado

* Ruta `/dashboard` protegida.
* Rutas base protegidas `/dashboard/clientes`, `/dashboard/mascotas`, `/dashboard/citas`.
* Layout interno con sidebar, header, avatar y breadcrumbs.
* Dark mode persistente.
* Vista responsive mobile/desktop.
* Logout funcional.

## Seed Admin Inicial implementado

* Script `npm run prisma:seed`.
* Usuario `admin@vetexpert.com`.
* Password inicial `Admin123*`.
* Rol `ADMIN`.
* Password hasheado bcryptjs.
* Seed idempotente probado: no duplica usuario.

## Gestion Clientes implementada

Backend:

* `GET /api/clientes`
* `GET /api/clientes/:id`
* `POST /api/clientes`
* `PATCH /api/clientes/:id`
* `DELETE /api/clientes/:id`
* Paginacion.
* Busqueda.
* Filtros por estado.
* Soft delete.
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`.

Frontend:

* `/dashboard/clientes`.
* Tabla responsive.
* Buscador.
* Filtros.
* Paginacion.
* Crear cliente.
* Editar cliente.
* Eliminar cliente.
* Modal detalle.
* Skeleton loaders.
* Toast notifications.

## Gestion Mascotas implementada

Backend:

* `GET /api/mascotas`
* `GET /api/mascotas/:id`
* `POST /api/mascotas`
* `PATCH /api/mascotas/:id`
* `DELETE /api/mascotas/:id`
* Paginacion.
* Busqueda libre (en nombre mascota, raza, nombre/apellido/DNI del cliente).
* Filtros por especie, estado y clienteId.
* Soft delete (activo = false y eliminadoEn).
* Validacion de existencia, rol CLIENTE y estado activo del dueño (clienteId).
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

* `/dashboard/mascotas`.
* Tabla responsive en desktop y tarjetas en mobile.
* Emojis identificadores por especie.
* Buscador debounceado (250ms).
* Filtros por estado y especie.
* Paginacion funcional.
* Modal de crear y editar.
* Selector de dueño interactivo con busqueda y autocompletado en tiempo real (consumiendo `/api/clientes`).
* Calculo visual dinamico de edad del animal.
* Drawer lateral con detalle completo de la mascota e informacion del dueño.
* Alertas Toast animadas.
* Skeleton loaders.
* Confirmacion de borrado.

## Gestion Citas implementada

Backend:

* `GET /api/citas`
* `GET /api/citas/:id`
* `POST /api/citas`
* `PATCH /api/citas/:id`
* `DELETE /api/citas/:id`
* Paginacion.
* Busqueda libre en motivo, observaciones, mascota, cliente y veterinario.
* Filtros por estado, veterinarioId, clienteId, mascotaId, fechaInicio y fechaFin.
* Estados `PENDIENTE`, `CONFIRMADA`, `COMPLETADA`, `CANCELADA`.
* Soft delete mediante `eliminadoEn`.
* Validacion de fecha no pasada al crear o reprogramar.
* Validacion de mascota activa y no eliminada.
* Validacion de veterinario activo, no eliminado, `tipoUsuario: STAFF` y `rol: VETERINARIO`.
* Asociacion automatica de `clienteId` desde la mascota seleccionada.
* Prevencion de doble booking exacto por `veterinarioId + fecha`.
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.
* `ADMIN` y `SECRETARIA`: CRUD completo.
* `VETERINARIO`: lectura de su propia agenda y actualizacion parcial de `observaciones`/`estado`.

Frontend:

* `/dashboard/citas`.
* Service `frontend/src/services/citas.ts` conectado a endpoints reales.
* Tabla responsive en desktop y tarjetas en mobile.
* Filtros por busqueda, estado, veterinario y rango de fechas.
* Paginacion funcional.
* Modal de crear y editar cita.
* Selector dependiente cliente -> mascotas activas del cliente.
* Selector de veterinario compatible con los datos disponibles del backend actual.
* Drawer lateral con detalle completo de cita, paciente, dueno y veterinario.
* Badges visuales para estados de cita.
* Alertas Toast animadas.
* Skeleton loaders.
* Confirmacion de borrado.

## Historia Clinica implementada parcialmente

Backend:

* Modelo Prisma `HistoriaClinica`.
* Migracion `20260525151556_fase_08_historia_clinica`.
* Modulo `HistoriasClinicasModule`.
* Service con reglas de negocio.
* DTOs de creacion, actualizacion y listado.
* Controller REST completo.
* `GET /api/historias-clinicas`
* `GET /api/historias-clinicas/:id`
* `GET /api/historias-clinicas/mascota/:mascotaId`
* `POST /api/historias-clinicas/cita/:citaId`
* `PATCH /api/historias-clinicas/:id`
* `PATCH /api/historias-clinicas/:id/cerrar`
* `PATCH /api/historias-clinicas/:id/reabrir`
* `DELETE /api/historias-clinicas/:id`
* Creacion solo desde citas `COMPLETADA`.
* Una unica historia clinica activa por cita.
* Derivacion automatica de `mascotaId` y `veterinarioId` desde la cita.
* Validacion de mascota activa.
* Validacion de veterinario `STAFF` con rol `VETERINARIO`.
* Bloqueo de edicion si `cerrada = true`.
* Reapertura solo por `ADMIN`.
* Soft delete mediante `eliminadoEn`.
* Guards JWT.
* Roles `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Frontend:

* Pendiente para Fase 08.4 en adelante.

## Prisma

Schema ubicado en:

```text
database/schema/schema.prisma
```

Migraciones aplicadas:

* `20260524000000_fase_02_auth`
* `20260524010000_fase_03_landing_contacto`
* `20260524020000_fase_05_clientes`
* `20260525001051_fase_06_mascotas`
* `20260525024949_fase_07_citas`
* `20260525151556_fase_08_historia_clinica`

## Endpoints activos

Auth:

* `POST /api/auth/staff/login`
* `POST /api/auth/clientes/login`
* `POST /api/auth/staff/google`
* `POST /api/auth/clientes/registro`
* `POST /api/auth/refresh`
* `POST /api/auth/recuperar`
* `GET /api/auth/perfil`

Contacto:

* `POST /api/contacto/mensajes`

Clientes:

* `GET /api/clientes`
* `GET /api/clientes/:id`
* `POST /api/clientes`
* `PATCH /api/clientes/:id`
* `DELETE /api/clientes/:id`

Mascotas:

* `GET /api/mascotas`
* `GET /api/mascotas/:id`
* `POST /api/mascotas`
* `PATCH /api/mascotas/:id`
* `DELETE /api/mascotas/:id`

Citas:

* `GET /api/citas`
* `GET /api/citas/:id`
* `POST /api/citas`
* `PATCH /api/citas/:id`
* `DELETE /api/citas/:id`

Historias Clinicas:

* `GET /api/historias-clinicas`
* `GET /api/historias-clinicas/:id`
* `GET /api/historias-clinicas/mascota/:mascotaId`
* `POST /api/historias-clinicas/cita/:citaId`
* `PATCH /api/historias-clinicas/:id`
* `PATCH /api/historias-clinicas/:id/cerrar`
* `PATCH /api/historias-clinicas/:id/reabrir`
* `DELETE /api/historias-clinicas/:id`

## Estado roadmap

Completado:

* Fase 01
* Fase 02 - Autenticacion
* Fase 03 - Landing Page
* Fase 04 - Acceso y Dashboard Base
* Fase 04.1 - Seed Admin Inicial
* Fase 05 - Gestion clientes
* Fase 06 - Mascotas
* Fase 07 - Citas

Proxima fase funcional:

* Fase 08 - Historia clinica

## Estado UX/UI

Base visual funcional implementada con landing publica y dashboard moderno.

Pendiente:

* Animaciones avanzadas.
* Charts.
* Mejoras responsive avanzadas por modulo.
* Fase 08 - Historia clinica.
