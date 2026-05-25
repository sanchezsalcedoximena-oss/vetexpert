# Progreso Actual - VetExpert

## Estado General

Proyecto funcionando correctamente en entorno local.

## Cambio de Alcance Confirmado

VetExpert queda redefinido como sistema exclusivamente administrativo/staff.

Roles activos finales:

* `ADMIN`
* `VETERINARIO`
* `SECRETARIA`

Fuera de alcance:

* Portal cliente.
* Login cliente.
* Registro público cliente.
* Autenticación cliente.
* Recuperación cliente orientada a cliente.
* Acceso cliente.
* Flujo multiportal.

Los clientes se conservan únicamente como registros administrativos internos: dueños de mascotas, datos de contacto, relación con citas e historia clínica.

Antes de nuevas fases funcionales se debe ejecutar una reestructuración auth/roles para retirar el concepto de cliente autenticado.

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
* Login cliente JWT implementado actualmente, pero marcado para eliminación.
* Refresh token.
* Roles actuales en código: `ADMIN`, `SECRETARIA`, `VETERINARIO`, `CLIENTE`.
* Roles objetivo: `ADMIN`, `SECRETARIA`, `VETERINARIO`.
* Registro cliente implementado actualmente, pero marcado para eliminación.
* Recuperacion de contrasena preparada; debe revisarse y limitarse a staff si se conserva.
* Guards JWT backend.
* Guards frontend para rutas privadas.
* Hash bcryptjs.
* Persistencia JWT frontend.
* Interceptor Axios con refresh automatico.
* Logout frontend.

Deuda por nuevo alcance:

* Eliminar `POST /api/auth/clientes/login`.
* Eliminar `POST /api/auth/clientes/registro`.
* Eliminar pantallas `/portal/login`, `/portal/registro`, `/login`, `/registro` cliente.
* Limpiar tipos frontend que incluyen `CLIENTE`.
* Ajustar cookies/storage que guardan `tipoUsuario`.
* Revisar si `POST /api/auth/recuperar` se conserva solo para staff.

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

Nota de alcance:

* Clientes ya no serán usuarios autenticados.
* Deben quedar como registros administrativos internos.
* La implementación actual usa `Usuario` con `tipoUsuario: CLIENTE` y `rol: CLIENTE`; esto queda marcado para refactor/migración.

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
* Validacion actual de existencia, tipo/rol cliente y estado activo del dueño (`clienteId`).
* Pendiente: refactorizar validacion para cliente administrativo no autenticable.
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
* Tipo `Cita` actualizado con resumen `historiaClinica` para flujo clinico.
* Tabla responsive en desktop y tarjetas en mobile.
* Filtros por busqueda, estado, veterinario y rango de fechas.
* Paginacion funcional.
* Modal de crear y editar cita.
* Selector dependiente cliente -> mascotas activas del cliente.
* Selector de veterinario compatible con los datos disponibles del backend actual.
* Drawer lateral con detalle completo de cita, paciente, dueno y veterinario.
* Badges visuales para estados de cita.
* Accion contextual en citas `COMPLETADA`: crear historia clinica si no existe o ver historia si ya existe.
* Modal de creacion de historia clinica integrado desde citas completadas.
* Drawer de detalle de historia clinica integrado desde citas completadas.
* Refinamiento 08.7: sincronizacion posterior a creacion desde cita, bloqueo de doble accion clinica y feedback para historias anuladas.
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

* Service `frontend/src/services/historias-clinicas.ts` conectado a endpoints reales.
* Tipos `HistoriaClinica`, `HistoriaClinicaDetalle`, `HistoriaClinicaPayload`, `HistoriasClinicasQuery`, `HistoriasClinicasResponse` y `HistoriasClinicasMeta`.
* Funciones de listado, detalle, creacion desde cita, actualizacion, cierre, reapertura y eliminacion.
* Componentes UI de timeline clinico implementados en `frontend/src/modules/historias-clinicas/components/`.
* Timeline clinico integrado dentro del drawer de detalle de mascota.
* Modal reutilizable de creacion/edicion de historia clinica preparado para creacion desde `citaId`.
* Drawer de detalle de historia clinica implementado.
* Badges visuales `Abierta`/`Cerrada`.
* Skeleton loaders, empty state, loading states, toast notifications y animaciones suaves.
* Permisos UI aplicados: `SECRETARIA` solo lectura, `VETERINARIO` edita/cierra historias abiertas, `ADMIN` puede reabrir.
* Integracion desde citas completadas implementada en Fase 08.6.
* Refinamiento 08.7 implementado:
  * Prevencion de acciones duplicadas al cerrar/reabrir/ver historias.
  * Mejor manejo visual de historias anuladas en citas completadas.
  * Modal de historia clinica endurecido contra edicion sin registro valido.
  * Mejoras de overflow y textos largos en drawers y timeline.
  * Backend devuelve conflicto controlado si una cita ya tuvo historia clinica registrada.

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
* `POST /api/auth/staff/google`
* `POST /api/auth/refresh`
* `GET /api/auth/perfil`

Auth heredado a retirar por nuevo alcance:

* `POST /api/auth/clientes/login`
* `POST /api/auth/clientes/registro`
* `POST /api/auth/recuperar` si permanece orientado a cliente; si se conserva debe limitarse a staff.

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
* Fase 08.1 - Prisma historia clinica
* Fase 08.2 - Backend modulo historia clinica
* Fase 08.3 - Endpoints historia clinica
* Fase 08.4 - Frontend services historia clinica
* Fase 08.5 - Timeline UI historia clinica
* Fase 08.6 - Integracion historia clinica desde citas completadas
* Fase 08.7 - Refinamiento y estabilizacion historia clinica

Proxima fase funcional:

* Fase 09 - Reestructuracion auth/roles y alcance staff-only

## Plan de Migracion Staff-only

Eliminar:

* Portal cliente y rutas `/portal/login`, `/portal/registro`.
* Login/registro cliente en backend y frontend.
* Tipos `CLIENTE` en sesión, navegación y guards frontend.
* Registro público de clientes.
* Recuperación de contraseña orientada a cliente.
* Dependencia de password para clientes administrativos.

Conservar:

* Clientes como dueños de mascotas.
* Relaciones actuales con mascotas, citas e historia clínica.
* Validaciones Perú de DNI, celular y correo.
* Login staff, refresh token, JWT, guards y roles staff.
* Landing pública y formulario de contacto.

Refactorizar:

* Modelo conceptual de clientes para que no sean usuarios autenticables.
* Validaciones de `clienteId` en mascotas/citas.
* DTOs y services de clientes para remover contraseña.
* Auth backend para roles finales `ADMIN`, `VETERINARIO`, `SECRETARIA`.
* Frontend auth, proxy, cookies y localStorage.
* Sidebar/dashboard para retirar permisos `CLIENTE`.

Mover de fase:

* Fase 09 deja de ser Portal cliente.
* Fase 09 será reestructuración auth/roles staff-only.
* Portal cliente queda eliminado del roadmap.
* Gestión de staff pasa a la fase posterior inmediata.

## Fases Futuras Reordenadas

* Fase 09 - Reestructuración auth/roles staff-only.
* Fase 10 - Gestión de staff.
* Fase 11 - Correcciones UX/UI y limpieza operativa.
* Fase 12 - Dashboard dinámico.
* Fase 13 - Reportes.
* Fase 14 - Configuración.
* Fase 15 - Mantenimiento futuro.

## Estado UX/UI

Base visual funcional implementada con landing publica y dashboard moderno.

Pendiente:

* Reestructuración auth/roles staff-only.
* Gestión administrativa de staff.
* Correcciones UX/UI detectadas: validaciones visuales login, icono ojo contraseña, selector veterinarios en citas, limpieza auth.
* Dashboard dinámico.
* Animaciones avanzadas.
* Charts.
* Mejoras responsive avanzadas por modulo.
