# Fase 10 - Implementacion Real: Gestion de Staff

Este documento registra el estado real implementado de Fase 10. El analisis base fue `docs/fase-10-analisis.md`.

La fase agrega gestion administrativa de usuarios staff sin reintroducir clientes autenticables.

---

## 1. Estado final real

Fase 10 queda implementada y cerrada.

Roles activos:

- `ADMIN`
- `VETERINARIO`
- `SECRETARIA`

No existe:

- `Rol.CLIENTE`
- `TipoUsuario`
- Portal cliente
- Login cliente
- Registro publico cliente
- Cliente autenticable

Modelo final:

```text
Usuario = staff interno autenticable
Cliente = registro administrativo no autenticable
```

---

## 2. Arquitectura final staff

Backend:

- Modulo `StaffModule`.
- Controller protegido por `JwtAuthGuard`, `RolesGuard` y `@Roles(Rol.ADMIN)`.
- Service con reglas de negocio y hardening administrativo.
- DTOs para crear, actualizar y listar staff.
- Persistencia sobre modelo Prisma `Usuario`.
- Sin cambios de schema Prisma.
- Sin migracion de Fase 10.

Frontend:

- Ruta `/dashboard/staff`.
- Service tipado `frontend/src/services/staff.ts`.
- Pagina administrativa `StaffPage`.
- Enlace lateral visible solo para `ADMIN`.
- Tabla responsive desktop y cards mobile.
- Modales crear/editar.
- Activar/inactivar.
- Filtros y paginacion.

---

## 3. Endpoints staff implementados

Prefijo:

```text
/api/staff
```

Endpoints:

- `GET /api/staff`
- `GET /api/staff/:id`
- `POST /api/staff`
- `PATCH /api/staff/:id`
- `PATCH /api/staff/:id/activar`
- `PATCH /api/staff/:id/inactivar`

Permisos:

- Solo `ADMIN`.

No implementado:

- Reset password.
- Auditoria.
- Permisos granulares.
- Soft delete.
- Avatars.
- Uploads.
- Websocket.

---

## 4. Reglas de backend

### Crear staff

Implementado:

- Roles validos: `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- Hash de contrasena con bcryptjs.
- Correo unico.
- DNI unico si se envia.
- Celular unico si se envia.
- Respuesta sin `passwordHash`.
- Respuesta sin refresh tokens.

### Listar staff

Implementado:

- Paginacion.
- Busqueda por nombres, apellidos, correo, DNI y celular.
- Filtro por rol.
- Filtro por estado: `activos`, `inactivos`, `todos`.

### Actualizar staff

Implementado:

- Edicion de datos administrativos.
- Cambio de rol con reglas anti-bloqueo.
- Sin actualizacion de password.
- Sin cambio de estado activo desde endpoint general.

### Activar/inactivar

Implementado:

- Activacion dedicada.
- Inactivacion dedicada.
- No usa soft delete.
- Al inactivar se revocan refresh tokens activos.

---

## 5. Hardening administrativo

Implementado:

- No permitir inactivar el ultimo `ADMIN` activo.
- No permitir degradar el ultimo `ADMIN` activo.
- No permitir auto-inactivacion del admin autenticado.
- No permitir que el admin autenticado se quite rol `ADMIN` si es el ultimo activo.
- Revocar refresh tokens al inactivar staff.
- Login staff bloquea usuarios inactivos.
- Refresh token bloquea usuarios inactivos.
- `JwtStrategy` verifica que el staff del access token siga activo, no eliminado y con correo/rol coincidente.

Errores usados:

- `BadRequestException`.
- `ConflictException`.
- `ForbiddenException`.
- `NotFoundException`.
- `UnauthorizedException` en JWT/auth.

---

## 6. Frontend staff

Ruta:

```text
/dashboard/staff
```

Implementado:

- Listado de staff.
- Busqueda.
- Filtro por rol.
- Filtro por estado.
- Paginacion.
- Tabla desktop.
- Cards mobile.
- Modal crear staff.
- Modal editar staff.
- Activar/inactivar.
- Badges de rol.
- Badges de estado.
- Loading states.
- Skeleton loaders.
- Empty state.
- Toast notifications.
- Errores backend visibles.
- Restriccion visual: solo `ADMIN`.

El frontend no mezcla `Cliente` administrativo con `Usuario` staff.

---

## 7. Integracion con citas

Compatibilidad preservada:

- `GET /api/usuarios/veterinarios` se mantiene.
- El endpoint sigue devolviendo solo usuarios con:
  - `rol: VETERINARIO`
  - `activo: true`
  - `eliminadoEn: null`
- El selector de veterinarios en citas sigue consumiendo `frontend/src/services/usuarios.ts`.
- El selector de citas sigue usando ids reales del backend.
- El selector controlado de veterinarios no fue revertido.

Comportamiento esperado:

- Veterinarios inactivos no aparecen para nuevas citas.
- Citas historicas conservan `veterinarioId`.
- Citas historicas siguen mostrando datos de veterinario por relacion persistente.
- Historias clinicas historicas siguen resolviendo veterinario por `veterinarioId`.

No se modificaron:

- `CitasService`.
- `HistoriasClinicasService`.
- `MascotasService`.
- `frontend/src/services/usuarios.ts`.
- `frontend/src/modules/citas/components/CitasPage.tsx`.

---

## 8. Compatibilidad preservada

Se preserva:

- Auth staff actual.
- JWT con payload `sub`, `correo`, `rol`.
- Refresh token staff.
- Dashboard existente.
- Dark mode.
- Responsive.
- Gestion de clientes administrativos.
- Mascotas.
- Citas.
- Historias clinicas.
- Contacto publico via WhatsApp.
- `GET /api/usuarios/veterinarios`.

No se crearon migraciones.

No se actualizaron dependencias.

No se ejecuto `npm audit`.

---

## 9. Decisiones importantes

- `Usuario` sigue siendo el modelo de staff autenticable.
- `Cliente` no participa en staff.
- `StaffModule` no reemplaza `UsuariosModule`.
- `UsuariosModule` conserva `GET /api/usuarios/veterinarios` como endpoint auxiliar para citas.
- La inactivacion de staff no elimina registros.
- La inactivacion revoca refresh tokens.
- No se implementa reset password en Fase 10.
- No se implementa auditoria en Fase 10.
- No se implementan permisos granulares en Fase 10.

---

## 10. Verificacion tecnica

Ejecutado:

```text
npm.cmd run typecheck --workspace backend
npm.cmd run typecheck --workspace frontend
```

Resultado:

- Backend typecheck pasa.
- Frontend typecheck pasa.

Verificacion de integracion:

- `GET /api/usuarios/veterinarios` mantiene filtro por veterinarios activos.
- Citas conserva relacion historica con veterinario.
- Historias clinicas conserva relacion historica con veterinario.
- El frontend de citas no fue modificado.

---

## 11. Riesgos futuros

- Implementar reset password staff.
- Implementar auditoria de cambios administrativos.
- Evaluar permisos granulares por modulo.
- Evaluar politicas de creacion de nuevos `ADMIN`.
- Validar manualmente flujos en navegador con datos reales.
- Endurecer proxy frontend si se requiere validacion de rol en middleware.
- Documentar proceso operativo para recuperar acceso si queda un unico admin.

---

## 12. Estado de cierre

Fase 10 queda cerrada oficialmente.

Base lista para Fase 11:

- Correcciones UX/UI.
- Limpieza operativa.
- Mejoras visuales y validaciones menores sin cambiar arquitectura staff-only.
