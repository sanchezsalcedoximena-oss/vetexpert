# Fase 09 - Analisis Tecnico: Reestructuracion auth/roles staff-only

Este documento formaliza la arquitectura definitiva de la Fase 09 de VetExpert. No implementa codigo, no elimina modulos, no crea migraciones y no modifica backend, frontend ni schema Prisma todavia.

La decision arquitectonica final ya esta tomada: VetExpert es un sistema exclusivamente administrativo para staff interno. No existe portal cliente ni cliente autenticado.

---

## 1. Objetivo de la fase

Eliminar definitivamente el concepto de cliente autenticado y consolidar el sistema como staff-only.

Roles finales del sistema:

* `ADMIN`
* `VETERINARIO`
* `SECRETARIA`

Reglas definitivas sobre `CLIENTE`:

* `CLIENTE` no pertenece a `STAFF`.
* `CLIENTE` no es usuario autenticable.
* `CLIENTE` no tendra JWT.
* `CLIENTE` no tendra password.
* `CLIENTE` no tendra sesion.
* `CLIENTE` no tendra portal.
* `CLIENTE` no tendra rutas auth.
* `CLIENTE` no sera rol de autorizacion.

Los clientes se conservan unicamente como entidad administrativa independiente para representar duenos de mascotas, datos de contacto y relaciones operativas con mascotas, citas e historias clinicas.

---

## 2. Arquitectura final obligatoria

Modelo final:

```text
Usuario = personal interno autenticable
Cliente = entidad administrativa independiente no autenticable
```

`Usuario` queda reservado exclusivamente para:

* administradores
* veterinarios
* secretarias
* credenciales de acceso interno
* refresh tokens internos
* recuperacion de acceso staff, cuando el flujo se complete
* relaciones donde un staff actua como profesional responsable

`Cliente` queda reservado exclusivamente para:

* nombres y apellidos del dueno
* DNI
* celular
* correo de contacto
* direccion
* estado administrativo
* relacion con mascotas
* relacion derivada con citas
* visualizacion como dueno dentro de historias clinicas

Eliminaciones definitivas:

* `Rol.CLIENTE`
* `TipoUsuario`
* campo `tipoUsuario`
* login cliente
* registro cliente auth
* portal cliente
* rutas auth cliente
* password de cliente
* sesion de cliente
* JWT cliente
* cualquier proveedor externo de autenticacion

Autenticacion final permitida:

* login staff con correo/password
* JWT access token
* refresh token interno

---

## 3. Estado actual detectado

### Backend

El backend actual todavia mezcla identidad autenticable y cliente administrativo en el modelo `Usuario`.

Puntos actuales que deben corregirse:

* `AuthService` tiene login staff y login cliente.
* `AuthController` expone `POST /api/auth/clientes/login`.
* `AuthController` expone `POST /api/auth/clientes/registro`.
* `AuthController` expone un endpoint de recuperacion que no esta restringido conceptualmente a staff.
* `JwtPayload` incluye `tipoUsuario: "STAFF" | "CLIENTE"`.
* `Rol` backend incluye `CLIENTE`.
* `ClientesService` crea clientes como `Usuario` con `rol: CLIENTE`, `tipoUsuario: CLIENTE` y `passwordHash`.
* `MascotasService` valida dueno con `tipoUsuario: CLIENTE`.
* `CitasService` e `HistoriasClinicasService` validan veterinarios usando `tipoUsuario: STAFF` y `rol: VETERINARIO`.

### Prisma

El schema actual tiene:

* Enum `Rol`: `ADMIN`, `SECRETARIA`, `VETERINARIO`, `CLIENTE`.
* Enum `TipoUsuario`: `STAFF`, `CLIENTE`.
* Modelo `Usuario` usado para staff y clientes.
* Campo obligatorio `passwordHash` en `Usuario`.
* Relaciones de clientes administrativos usando `Usuario`:
  * `Usuario.mascotas`
  * `Usuario.citasComoCliente`
  * `Mascota.cliente`
  * `Cita.cliente`

### Frontend

El frontend conserva piezas de cliente autenticado:

* `/portal/login`
* `/portal/registro`
* `/registro`
* rutas y copy asociados a portal cliente
* funciones de auth cliente
* tipos de sesion con `CLIENTE`
* tipos de sesion con `tipoUsuario`
* cookie/localStorage `vetexpert_tipo_usuario`
* navegacion de dashboard con permisos residuales para `CLIENTE`
* proxy con rutas auth de portal cliente

---

## 4. Impacto arquitectonico

La Fase 09 separa definitivamente dos conceptos que hoy estan mezclados:

```text
Identidad autenticable interna -> Usuario
Registro administrativo de dueno -> Cliente
```

Esta separacion mantiene Clean Architecture porque:

* las reglas de negocio quedan en services backend
* los controllers siguen siendo delgados
* los DTOs expresan contratos por modulo
* Prisma representa relaciones persistentes explicitas
* los guards solo protegen acceso staff
* el frontend consume services tipados
* la UI conserva dashboard interno, dark mode, responsive y diseno premium actual

La reestructuracion debe preservar las relaciones funcionales existentes:

```text
Cliente 1:N Mascotas
Cliente 1:N Citas
Mascota 1:N Citas
Cita 1:1 HistoriaClinica
Mascota 1:N HistoriasClinicas
Usuario(VETERINARIO) 1:N Citas
Usuario(VETERINARIO) 1:N HistoriasClinicas
```

---

## 5. Modulos afectados

### Backend afectados directamente

* `backend/src/auth/auth.controller.ts`
* `backend/src/auth/auth.service.ts`
* `backend/src/auth/types/jwt-payload.type.ts`
* `backend/src/auth/dto/registro-cliente.dto.ts`
* `backend/src/auth/dto/recuperar-contrasena.dto.ts`
* `backend/src/common/enums/rol.enum.ts`
* `backend/src/common/guards/roles.guard.ts`
* `backend/src/clientes/clientes.service.ts`
* `backend/src/clientes/clientes.controller.ts`
* `backend/src/clientes/dto/crear-cliente.dto.ts`
* `backend/src/clientes/dto/actualizar-cliente.dto.ts`
* `backend/src/mascotas/mascotas.service.ts`
* `backend/src/citas/citas.service.ts`
* `backend/src/historias-clinicas/historias-clinicas.service.ts`

### Prisma afectados directamente

* `database/schema/schema.prisma`
* migracion futura de Fase 09
* seed admin

### Frontend afectados directamente

* `frontend/src/services/auth.ts`
* `frontend/src/services/api.ts`
* `frontend/src/services/clientes.ts`
* `frontend/src/store/auth-store.ts`
* `frontend/src/proxy.ts`
* `frontend/src/types/roles.ts`
* `frontend/src/modules/auth/components/AccesoForm.tsx`
* `frontend/src/modules/auth/components/RegistroClienteForm.tsx`
* `frontend/src/modules/dashboard/components/DashboardShell.tsx`
* rutas App Router de login, registro, portal y recuperacion

### Modulos fuera de alcance de implementacion funcional nueva

* Gestion completa de staff queda para Fase 10.
* Correcciones UX/UI generales quedan para Fase 11.
* Dashboard dinamico, reportes, configuracion y mantenimiento futuro no se avanzan en Fase 09.

---

## 6. Cambios backend requeridos

### Auth

Eliminar definitivamente:

* metodo `loginCliente`
* metodo `registrarCliente`
* endpoint `POST /api/auth/clientes/login`
* endpoint `POST /api/auth/clientes/registro`
* DTO `RegistroClienteDto`
* generacion de sesiones para clientes
* cualquier emision de JWT para clientes
* cualquier refresh token asociado a clientes

Mantener:

* `POST /api/auth/staff/login`
* `POST /api/auth/refresh`
* `GET /api/auth/perfil`

El endpoint de recuperacion debe quedar definido como flujo staff-only. Si el flujo no queda completado en esta fase, no debe existir como recuperacion orientada a cliente ni publicar copy de portal cliente.

`refrescarToken` debe emitir sesion solo para usuarios internos con rol `ADMIN`, `SECRETARIA` o `VETERINARIO`.

`obtenerPerfil` debe responder solo datos de staff y no debe devolver `tipoUsuario`.

### Roles

Eliminar `CLIENTE` del enum backend `Rol`.

Todos los permisos backend deben quedar expresados exclusivamente con:

* `Rol.ADMIN`
* `Rol.SECRETARIA`
* `Rol.VETERINARIO`

`RolesGuard` permanece como mecanismo de autorizacion por rol, pero su dominio final no incluye `CLIENTE`.

### Clientes

`ClientesService` debe operar sobre el modelo administrativo `Cliente`, no sobre `Usuario`.

Cambios obligatorios:

* crear clientes en tabla/modelo `Cliente`
* eliminar password del DTO de crear cliente
* eliminar password del DTO de actualizar cliente
* eliminar hash de contrasena temporal
* eliminar `rol: CLIENTE`
* eliminar `tipoUsuario: CLIENTE`
* mantener validaciones de DNI, celular, correo, direccion y activo
* mantener soft delete
* mantener respuestas administrativas sin campos de credenciales

### Mascotas

Actualizar validacion de dueno:

Estado actual:

```text
usuario where id = clienteId, tipoUsuario = CLIENTE, activo = true, eliminadoEn = null
```

Estado final:

```text
cliente where id = clienteId, activo = true, eliminadoEn = null
```

Mantener:

* relacion `clienteId`
* filtros por cliente
* busqueda por nombres, apellidos y DNI del dueno
* permisos actuales por roles staff

### Citas

Actualizar relacion y selects de `cliente` para apuntar al modelo `Cliente`.

Mantener:

* `clienteId` derivado desde la mascota
* veterinario como `Usuario` staff con rol `VETERINARIO`
* restricciones por rol
* busqueda por dueno
* resumen de historia clinica

La integridad esperada es que toda cita siga teniendo un cliente administrativo valido.

### Historias clinicas

Actualizar selects indirectos de dueno desde cita/cliente.

Mantener:

* `veterinarioId` asociado a `Usuario` staff
* reglas de historia por cita completada
* permisos `ADMIN`, `VETERINARIO`, `SECRETARIA`
* restriccion de veterinario responsable

### Contacto publico

El formulario publico de contacto de la landing no pertenece al dominio de clientes administrativos ni al dominio auth.

Reglas finales:

* contacto publico no es cliente administrativo
* contacto publico no es auth
* contacto publico no es registro
* contacto publico no crea entidades `Cliente`
* contacto publico no crea usuarios
* contacto publico no usa Prisma
* contacto publico no genera JWT
* contacto publico no genera sesiones
* contacto publico no emite refresh tokens

`Cliente` solo puede ser creado desde el dashboard staff interno, mediante el modulo administrativo de clientes y con permisos staff.

El comportamiento backend actual relacionado a `ContactoModule`, `ContactoController`, `ContactoService`, `CrearMensajeContactoDto` y `MensajeContacto` queda marcado para ser retirado del flujo final de contacto publico. El formulario publico no debe persistir mensajes en PostgreSQL ni depender de `/api/contacto/mensajes`.

---

## 7. Cambios frontend requeridos

### Auth y services

Eliminar definitivamente:

* `loginCliente`
* `registrarCliente`
* tipos `CLIENTE`
* tipo `tipoUsuario`
* cookie `vetexpert_tipo_usuario`
* lectura/escritura de `tipoUsuario` en refresh
* cualquier referencia a portal cliente
* cualquier referencia a registro cliente auth

Mantener:

* `loginStaff`
* `refrescarSesion`
* `obtenerPerfil`
* `cerrarSesionLocal`

### Rutas

Eliminar o redirigir fuera del flujo publico:

* `/portal/login`
* `/portal/registro`
* `/registro`

`/login` debe ser staff-only o redirigir a `/staff/login`.

`/recuperar` debe quedar staff-only cuando exista el flujo; no debe presentarse como recuperacion de cliente.

### Componentes auth

`AccesoForm` debe quedar staff-only.

Eliminar:

* variante cliente
* copy de portal cliente
* link "Soy cliente"
* link "Crear cuenta"
* cualquier llamada a auth cliente

`RegistroClienteForm` no pertenece al flujo auth. La gestion de clientes administrativos vive dentro de `/dashboard/clientes`.

### Dashboard y navegacion

`DashboardShell` debe retirar `CLIENTE` de:

* tipo `RolDashboard`
* enlaces permitidos
* render condicional
* permisos visuales

`proxy.ts` debe proteger dashboard como area staff-only.

La navegacion lateral debe quedar limitada a:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

### Clientes UI

`ClientePayload` debe eliminar `contrasena`.

Los formularios de gestion de clientes administrativos no deben mostrar ni enviar campos de password.

Mantener:

* buscador
* filtros
* paginacion
* crear/editar/eliminar cliente administrativo
* dark mode
* responsive
* estilo premium actual

### Contacto publico en landing

El formulario visual de contacto se mantiene en la landing publica, reutilizando la experiencia visual actual de `ContactForm`.

Comportamiento final obligatorio:

* no llamar a `frontend/src/services/contacto.ts`
* no llamar a `/api/contacto/mensajes`
* no crear `Cliente`
* no crear `Usuario`
* no iniciar sesion
* no guardar datos en Prisma
* abrir WhatsApp con `https://api.whatsapp.com/send/?phone=51946223649&text=`

El texto enviado a WhatsApp debe construirse automaticamente con los campos del formulario:

* nombres
* celular
* correo
* asunto
* mensaje

La URL debe serializar y codificar correctamente el contenido usando codificacion de query string para que espacios, saltos de linea, simbolos y caracteres especiales no rompan el enlace.

Formato conceptual del destino:

```text
https://api.whatsapp.com/send/?phone=51946223649&text={mensajeCodificado}
```

Formato conceptual del mensaje:

```text
Nombres: {nombres}
Celular: {celular}
Correo: {correo}
Asunto: {asunto}
Mensaje: {mensaje}
```

Referencias actuales a revisar al implementar:

* `frontend/src/services/contacto.ts`
* `frontend/src/modules/landing/components/ContactForm.tsx`
* `frontend/src/modules/landing/components/LandingPage.tsx`
* seccion `#contacto` de landing
* imports de `enviarMensajeContacto`
* `backend/src/contacto/contacto.controller.ts`
* `backend/src/contacto/contacto.service.ts`
* `backend/src/contacto/contacto.module.ts`
* `backend/src/contacto/dto/crear-mensaje-contacto.dto.ts`
* `MensajeContacto` en Prisma

---

## 8. Cambios Prisma requeridos

### Modelo final obligatorio

Crear modelo administrativo independiente:

```prisma
model Cliente {
  id            String    @id @default(uuid()) @db.Uuid
  nombres       String
  apellidos     String
  correo        String    @unique
  dni           String?   @unique
  celular       String?   @unique
  direccion     String?
  activo        Boolean   @default(true)
  creadoEn      DateTime  @default(now()) @map("creado_en")
  actualizadoEn DateTime  @updatedAt @map("actualizado_en")
  eliminadoEn   DateTime? @map("eliminado_en")

  mascotas      Mascota[]
  citas         Cita[]

  @@map("clientes")
}
```

Actualizar relaciones:

* `Mascota.cliente -> Cliente`
* `Cita.cliente -> Cliente`
* `Usuario.mascotas` se elimina
* `Usuario.citasComoCliente` se elimina

`Usuario` queda como modelo staff-only:

* conserva `passwordHash`
* conserva `refreshTokens`
* conserva `recuperacionesClave` solo para staff
* conserva `citasComoVeterinario`
* conserva `historiasClinicas`
* elimina `tipoUsuario`
* elimina cualquier relacion de cliente administrativo

Enums finales:

```prisma
enum Rol {
  ADMIN
  SECRETARIA
  VETERINARIO
}
```

El enum `TipoUsuario` se elimina definitivamente.

---

## 9. Impacto en JWT/auth

JWT actual:

```ts
{
  sub: string;
  correo: string;
  rol: Rol;
  tipoUsuario: "STAFF" | "CLIENTE";
}
```

JWT final:

```ts
{
  sub: string;
  correo: string;
  rol: "ADMIN" | "SECRETARIA" | "VETERINARIO";
}
```

Impactos obligatorios:

* no se emiten tokens para clientes
* no se refrescan sesiones de clientes
* no se aceptan perfiles de clientes
* no se persiste `tipoUsuario` en frontend
* se limpia `vetexpert_tipo_usuario` como dato legacy local
* access token y refresh token quedan reservados para staff interno

El refresh token interno debe pertenecer siempre a un `Usuario` staff activo y no eliminado.

---

## 10. Impacto en guards y navegacion

### Backend

`JwtAuthGuard` se mantiene como guard de autenticacion JWT.

`RolesGuard` se mantiene como guard de autorizacion por rol.

Dominio final de roles permitidos:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

`GET /auth/perfil` debe responder unicamente para staff autenticado.

Ningun endpoint protegido debe contemplar `CLIENTE` como rol valido.

### Frontend

`proxy.ts` debe tratar el dashboard como area interna staff-only.

La sesion local debe considerarse valida solo si el rol pertenece a:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

La navegacion lateral no debe incluir `CLIENTE`.

Las rutas de portal cliente y registro cliente auth deben desaparecer del flujo.

---

## 11. Estrategia de migracion segura

La migracion debe preservar datos de clientes, mascotas, citas e historias clinicas.

Plan obligatorio:

1. Auditar datos actuales:
   * contar usuarios con `tipoUsuario = CLIENTE`
   * contar mascotas por cliente actual
   * contar citas por cliente actual
   * identificar clientes con datos incompletos

2. Crear tabla administrativa `clientes`:
   * copiar los clientes actuales desde `usuarios`
   * preservar los mismos IDs cuando sea viable para reducir riesgo de FKs
   * copiar nombres, apellidos, correo, DNI, celular, direccion, activo, creado/actualizado/eliminado

3. Reapuntar relaciones:
   * `mascotas.cliente_id` hacia `clientes.id`
   * `citas.cliente_id` hacia `clientes.id`

4. Validar integridad:
   * toda mascota conserva cliente administrativo
   * toda cita conserva cliente administrativo
   * toda historia clinica sigue resolviendo dueno por cita y mascota

5. Limpiar auth:
   * eliminar endpoints cliente
   * eliminar DTO registro cliente auth
   * revocar o invalidar refresh tokens de usuarios cliente legacy
   * impedir cualquier perfil o refresh que no pertenezca a staff

6. Limpiar modelo `Usuario`:
   * eliminar relaciones de cliente
   * eliminar `tipoUsuario`
   * eliminar enum `TipoUsuario`
   * eliminar `CLIENTE` de `Rol`

7. Limpiar frontend:
   * eliminar rutas portal/registro cliente
   * eliminar auth cliente en services
   * limpiar tipos de sesion
   * limpiar cookie/storage legacy
   * ajustar dashboard staff-only

8. Verificar:
   * typecheck backend
   * typecheck frontend
   * login staff con correo/password
   * refresh token interno
   * CRUD clientes administrativos
   * alta/edicion de mascotas
   * citas con derivacion de `clienteId`
   * historia clinica desde cita completada

No se ejecutan migraciones hasta aprobacion explicita de implementacion.

---

## 12. Riesgos

* Perdida de relaciones si `clienteId` cambia sin migrar FKs correctamente.
* Ruptura de selects Prisma en mascotas, citas o historias al cambiar relacion `cliente`.
* Inconsistencia por unique constraints al mover correo, DNI y celular desde `usuarios` hacia `clientes`.
* Formularios frontend enviando `contrasena` residual a clientes.
* `proxy.ts` permitiendo dashboard por token sin verificar rol staff final.
* Migracion de enum PostgreSQL requiere pasos cuidadosos para retirar valores usados.
* Seed admin debe seguir funcionando con `Usuario` staff-only.
* Refresh tokens legacy deben quedar invalidados para cualquier identidad que no sea staff.

---

## 13. Deuda tecnica identificada

* `Cliente` esta modelado como `Usuario`, mezclando identidad y registro administrativo.
* `Rol.CLIENTE` existe aunque no pertenece al alcance final.
* `TipoUsuario` existe para separar conceptos que deben separarse por modelo.
* `passwordHash` obligatorio obliga a generar contrasenas temporales para clientes administrativos.
* Auth frontend conserva portal cliente y registro publico.
* `vetexpert_tipo_usuario` queda como cookie/storage heredado.
* `frontend/src/types/roles.ts` usa roles en minusculas e incluye `cliente`.
* `GET /auth/perfil` no esta definido aun como staff-only estricto.
* La recuperacion de acceso debe quedar staff-only o salir del flujo publico.

---

## 14. Plan por subfases

### Fase 09.1 - Bloqueo definitivo de auth cliente

* Retirar endpoints cliente de auth.
* Retirar registro cliente auth.
* Limitar refresh y perfil a staff.
* Retirar `CLIENTE` del contrato de sesion frontend.
* Eliminar referencias a portal cliente.

### Fase 09.2 - Prisma y migracion a Cliente administrativo

* Agregar modelo `Cliente`.
* Migrar clientes actuales desde `Usuario` hacia `Cliente`.
* Reapuntar `Mascota` y `Cita`.
* Preservar IDs cuando sea viable.
* Validar integridad referencial.

### Fase 09.3 - Refactor backend por modulos

* Actualizar `ClientesService` a modelo `Cliente`.
* Actualizar `MascotasService`.
* Actualizar `CitasService`.
* Actualizar `HistoriasClinicasService`.
* Retirar password y rol de clientes.
* Retirar `Rol.CLIENTE`.
* Retirar `TipoUsuario`.

### Fase 09.4 - Limpieza frontend staff-only

* Retirar rutas portal/registro cliente.
* Simplificar `AccesoForm` a staff.
* Ajustar `proxy.ts`.
* Limpiar `services/auth.ts` y `services/api.ts`.
* Limpiar `DashboardShell`.
* Actualizar payload de clientes.

### Fase 09.5 - Verificacion y documentacion

* Ejecutar typecheck backend.
* Ejecutar typecheck frontend.
* Probar login staff con correo/password.
* Probar refresh token interno.
* Probar CRUD cliente administrativo.
* Probar alta/edicion de mascota.
* Probar citas con derivacion de `clienteId`.
* Probar historia clinica desde cita completada.
* Actualizar documentacion de resultado real de implementacion cuando la fase sea aprobada y ejecutada.

---

## 15. Criterios de cierre

La Fase 09 se considera cerrada cuando:

* No existe endpoint de login cliente.
* No existe endpoint de registro publico cliente.
* No existe portal cliente.
* No existen rutas auth cliente.
* Ningun JWT nuevo incluye `CLIENTE`.
* Ningun JWT nuevo incluye `tipoUsuario`.
* Refresh y perfil funcionan solo para staff.
* `Rol.CLIENTE` no existe en backend ni frontend.
* `TipoUsuario` no existe en Prisma ni contratos de aplicacion.
* `Usuario` representa unicamente staff autenticable.
* `Cliente` representa una entidad administrativa independiente.
* Clientes se gestionan sin password.
* Mascotas siguen asociadas a clientes administrativos.
* Citas siguen derivando `clienteId` desde la mascota.
* Historias clinicas siguen mostrando dueno por cita/mascota.
* Dashboard no contiene permisos ni navegacion para `CLIENTE`.
* Auth usa solo correo/password, JWT y refresh token interno.
* Dark mode y responsive siguen funcionando.
* Backend typecheck pasa.
* Frontend typecheck pasa.
* No se modificaron dependencias.
* No se ejecuto `npm audit`.
* No se avanzaron fases futuras.

---

## 16. Cierre de analisis

Este analisis deja la Fase 09 definida con arquitectura final staff-only.

No se realizaron cambios de codigo, no se eliminaron modulos, no se modifico Prisma schema y no se ejecutaron migraciones.
