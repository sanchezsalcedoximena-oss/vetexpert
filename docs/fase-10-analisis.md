# Fase 10 - Analisis Tecnico: Gestion de Staff

Este documento define el analisis inicial para una futura Fase 10. No implementa codigo, no crea migraciones y no modifica contratos actuales.

La Fase 10 debe construir gestion administrativa de personal interno sobre la arquitectura staff-only consolidada en Fase 09.

---

## 1. Objetivo

Permitir que usuarios con rol `ADMIN` gestionen el staff interno del sistema:

- Crear usuarios staff.
- Listar usuarios staff.
- Ver detalle de un usuario staff.
- Editar datos administrativos y rol permitido.
- Activar usuarios.
- Inactivar usuarios.
- Mantener acceso autenticable solo para personal interno.

No se debe crear ningun portal publico ni registro publico de staff.

---

## 2. Alcance funcional esperado

CRUD staff:

- Crear veterinarios.
- Crear secretarias.
- Crear administradores solo si producto lo confirma.
- Editar nombres, apellidos, correo, DNI, celular, direccion y rol.
- Listar con paginacion, busqueda, filtros por rol y estado.
- Obtener detalle.
- Activar/inactivar.

Fuera de alcance inicial recomendado:

- Eliminacion fisica.
- Autoregistro.
- Invitaciones por correo.
- Auditoria avanzada.
- Permisos granulares por modulo.
- Portal cliente.

---

## 3. Roles gestionables

Roles base:

- `VETERINARIO`
- `SECRETARIA`

Rol sensible:

- `ADMIN`

Decision pendiente:

- Definir si un `ADMIN` puede crear otros `ADMIN`.
- Definir si un `ADMIN` puede inactivar su propia cuenta.
- Definir si debe existir al menos un `ADMIN` activo siempre.

Recomendacion tecnica:

- Permitir crear/editar `VETERINARIO` y `SECRETARIA`.
- Permitir `ADMIN` solo con regla explicita y validaciones anti-bloqueo.

---

## 4. Permisos ADMIN

Todos los endpoints de gestion de staff deben requerir:

- `JwtAuthGuard`.
- `RolesGuard`.
- `@Roles(Rol.ADMIN)`.

Reglas esperadas:

- Solo `ADMIN` lista staff completo.
- Solo `ADMIN` crea staff.
- Solo `ADMIN` cambia rol.
- Solo `ADMIN` activa/inactiva staff.
- Un usuario no debe poder inactivarse a si mismo sin validacion especial.
- No se debe permitir dejar el sistema sin administradores activos.

---

## 5. Endpoints previstos

Prefijo propuesto:

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

Opcionales para subfase posterior:

- `PATCH /api/staff/:id/resetear-contrasena`
- `PATCH /api/staff/:id/cambiar-rol`

No previstos:

- `POST /api/staff/registro-publico`.
- `POST /api/auth/staff/registro`.
- Cualquier endpoint anonimo para crear staff.

---

## 6. Impacto Prisma

Modelo actual `Usuario` ya sirve como base para staff:

- `id`
- `nombres`
- `apellidos`
- `correo`
- `dni`
- `celular`
- `direccion`
- `passwordHash`
- `rol`
- `activo`
- `ultimoAccesoEn`
- `creadoEn`
- `actualizadoEn`
- `eliminadoEn`
- `refreshTokens`
- `recuperacionesClave`

Cambios Prisma esperados:

- Probablemente no se requiere nuevo modelo.
- Puede requerirse migracion si se agregan campos de auditoria, invitacion o cambio de password.
- Mantener `Usuario` como staff-only.

Indices/constraints existentes a considerar:

- `correo` unico.
- `dni` unico opcional.
- `celular` unico opcional.

Riesgo:

- Conflictos de correo/DNI/celular entre `Usuario` staff y `Cliente` administrativo no estan unificados por base de datos porque son tablas distintas. Producto debe decidir si eso es aceptable.

---

## 7. Impacto backend

Modulo propuesto:

- `backend/src/staff/staff.module.ts`
- `backend/src/staff/staff.controller.ts`
- `backend/src/staff/staff.service.ts`
- `backend/src/staff/dto/crear-staff.dto.ts`
- `backend/src/staff/dto/actualizar-staff.dto.ts`
- `backend/src/staff/dto/listar-staff.dto.ts`

Alternativa:

- Extender `UsuariosModule`.

Recomendacion:

- Crear `StaffModule` si el lenguaje de producto sera "staff".
- Mantener `UsuariosModule` para endpoints auxiliares existentes como `GET /api/usuarios/veterinarios`, o migrarlo despues con cuidado.

Responsabilidades del service:

- Validar duplicados.
- Hashear contrasena inicial.
- Aplicar reglas anti-bloqueo de administradores.
- Revocar refresh tokens al inactivar.
- Evitar exposicion de `passwordHash`.
- Filtrar eliminados logicamente.

---

## 8. DTOs esperados

### CrearStaffDto

Campos esperados:

- `nombres`: string requerido.
- `apellidos`: string requerido.
- `correo`: email requerido.
- `dni`: string opcional o requerido segun negocio.
- `celular`: string opcional.
- `direccion`: string opcional.
- `rol`: `VETERINARIO | SECRETARIA | ADMIN` segun decision.
- `contrasena`: string requerido en implementacion inicial simple.
- `activo`: boolean opcional.

Validaciones:

- Correo valido.
- DNI Peru si se envia: 8 digitos.
- Celular Peru si se envia: 9 digitos iniciando en 9.
- Contrasena con minimo seguro.
- Rol dentro de enum staff.

### ActualizarStaffDto

Campos opcionales:

- `nombres`.
- `apellidos`.
- `correo`.
- `dni`.
- `celular`.
- `direccion`.
- `rol`.
- `activo` solo si se decide permitirlo aqui.

Recomendacion:

- Usar endpoints dedicados para activar/inactivar.
- Evitar actualizar password desde el mismo DTO general.

### ListarStaffDto

Query params esperados:

- `pagina`.
- `limite`.
- `busqueda`.
- `rol`.
- `estado`: `activos | inactivos | todos`.

---

## 9. Guards y permisos

Guards existentes a reutilizar:

- `JwtAuthGuard`.
- `RolesGuard`.

Decorador:

- `@Roles(Rol.ADMIN)`.

Reglas adicionales en service:

- No inactivar el ultimo `ADMIN` activo.
- No degradar el ultimo `ADMIN` activo.
- No eliminar logicamente el ultimo `ADMIN` activo si se agrega delete.
- Revocar refresh tokens al inactivar un staff.
- Impedir login de usuarios inactivos o eliminados, ya cubierto por AuthService actual.

---

## 10. Impacto frontend

Rutas previstas:

- `/dashboard/staff`
- `/dashboard/staff/[id]` opcional si se usa pagina de detalle.

Componentes esperados:

- `StaffPage`.
- Tabla/listado con filtros.
- Modal o drawer de crear staff.
- Modal o drawer de editar staff.
- Confirmacion de activar/inactivar.
- Badge de rol.
- Badge de estado.

Navegacion:

- Agregar enlace "Staff" solo para `ADMIN`.

Servicios:

- `frontend/src/services/staff.ts`.

Tipos:

- `Staff`.
- `CrearStaffPayload`.
- `ActualizarStaffPayload`.
- `RolStaff`.

UX:

- No presentar registro publico.
- No mezclar clientes administrativos con staff.
- No exponer `passwordHash`.
- Confirmar acciones sensibles como inactivar.

---

## 11. Arquitectura esperada

Clean Architecture dentro del monolito modular:

- Controller delgado.
- DTOs validan entrada.
- Service contiene reglas de negocio.
- Prisma persiste `Usuario`.
- Guards aplican autenticacion/autorizacion.
- Frontend consume servicios tipados.
- UI respeta dashboard interno actual.

Relaciones relevantes:

```text
Usuario(VETERINARIO) 1:N Citas
Usuario(VETERINARIO) 1:N HistoriasClinicas
Usuario(ADMIN/SECRETARIA) = staff administrativo autenticable
```

Inactivar un veterinario no debe romper citas o historias historicas. Debe impedir nuevas asignaciones si esta inactivo.

---

## 12. Estrategia de migracion

Escenario probable:

- No se requiere migracion para CRUD basico porque `Usuario` ya contiene campos necesarios.

Si se agregan campos nuevos:

1. Crear migracion especifica Fase 10.
2. Mantener compatibilidad con usuarios existentes.
3. Seed/admin actual debe seguir funcionando.
4. Validar login staff existente.
5. Validar `GET /api/usuarios/veterinarios`.

Datos existentes:

- Usuarios actuales son staff.
- No deben tocarse clientes administrativos.
- No deben tocarse relaciones de mascotas/citas/historias.

---

## 13. Riesgos

- Inactivar todos los administradores y bloquear el sistema.
- Cambiar rol de un veterinario con citas/historias asociadas.
- Duplicar reglas entre `UsuariosModule` y futuro `StaffModule`.
- Exponer `passwordHash` en respuestas.
- No revocar refresh tokens al inactivar staff.
- Permitir que `SECRETARIA` o `VETERINARIO` gestionen staff por error.
- Confundir `Cliente` administrativo con `Usuario` staff en UI o naming.
- Permitir creacion publica de staff por reutilizar patrones auth.
- Romper selector de veterinarios en citas al modificar usuarios.

---

## 14. Plan por subfases

### Fase 10.1 - Contrato y modulo backend

- Definir decision sobre creacion de `ADMIN`.
- Crear DTOs.
- Crear service/controller.
- Proteger endpoints con `ADMIN`.
- Validar duplicados.

### Fase 10.2 - Reglas de seguridad

- Anti-bloqueo de ultimo admin.
- Revocacion de refresh tokens al inactivar.
- Respuestas sin `passwordHash`.
- Tests o validaciones manuales de permisos.

### Fase 10.3 - Frontend staff

- Crear service `staff`.
- Crear pagina `/dashboard/staff`.
- Agregar enlace solo para `ADMIN`.
- Implementar listado, filtros, crear, editar, activar/inactivar.

### Fase 10.4 - Integracion con citas

- Confirmar que veterinarios inactivos no aparecen en selector.
- Confirmar que citas historicas conservan veterinario.
- Confirmar que historias clinicas historicas siguen resolviendo veterinario.

### Fase 10.5 - Verificacion y documentacion

- Typecheck backend.
- Typecheck frontend.
- Validacion manual de endpoints.
- Actualizar `docs/endpoints.md`.
- Crear documento de implementacion real de Fase 10.

---

## 15. Criterios de cierre

Fase 10 se considera cerrada cuando:

- Solo `ADMIN` puede acceder a gestion staff.
- Se puede listar staff con filtros.
- Se puede crear staff con rol permitido.
- Se puede editar staff sin exponer credenciales.
- Se puede activar/inactivar staff.
- No se puede inactivar/degradar el ultimo `ADMIN` activo.
- Al inactivar staff se revocan refresh tokens activos.
- Login staff sigue funcionando.
- Selector de veterinarios en citas sigue funcionando.
- Clientes administrativos siguen separados de staff.
- No existe registro publico de staff.
- No se modifica portal cliente porque no existe.
- Typecheck backend pasa.
- Typecheck frontend pasa.
- Documentacion queda actualizada con estado real.

---

## 16. Estado de este documento

Este archivo es solo analisis tecnico inicial.

Fase 10 no esta implementada todavia.
