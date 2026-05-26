# Fase 09 - Implementacion Real: Staff-only

Este documento registra el estado real implementado de la Fase 09. El contrato tecnico base fue `docs/fase-09-analisis.md`.

La fase consolida VetExpert como sistema administrativo/staff-only.

---

## 1. Estado final real

VetExpert quedo con esta separacion:

```text
Usuario = personal interno autenticable
Cliente = entidad administrativa independiente no autenticable
```

Roles activos:

- `ADMIN`
- `VETERINARIO`
- `SECRETARIA`

Ya no existe:

- `Rol.CLIENTE`.
- `TipoUsuario`.
- Campo `tipoUsuario`.
- Login cliente.
- Registro cliente auth.
- JWT cliente.
- Refresh token cliente.
- Portal cliente funcional.

---

## 2. Arquitectura staff-only implementada

`Usuario` queda reservado para:

- Login interno.
- Password hash.
- Rol staff.
- Refresh tokens.
- Recuperaciones de clave staff.
- Veterinario responsable en citas.
- Veterinario responsable en historias clinicas.

`Cliente` queda reservado para:

- Nombres y apellidos del dueno.
- DNI.
- Celular.
- Correo.
- Direccion.
- Estado administrativo.
- Relacion con mascotas.
- Relacion con citas.
- Visualizacion del dueno en historias clinicas.

---

## 3. Cambios backend implementados

### Auth

Implementado:

- `POST /api/auth/staff/login`.
- `POST /api/auth/refresh`.
- `GET /api/auth/perfil`.
- `POST /api/auth/recuperar` filtrado a staff.
- JWT sin `tipoUsuario`.
- Refresh token validado contra staff activo y no eliminado.
- Perfil con `id`, `correo` y `rol`.

Eliminado del contrato:

- `POST /api/auth/clientes/login`.
- `POST /api/auth/clientes/registro`.
- Metodos de login/registro cliente.

### Roles

`backend/src/common/enums/rol.enum.ts` contiene solo:

- `ADMIN`
- `SECRETARIA`
- `VETERINARIO`

`RolesGuard` permanece como mecanismo de autorizacion por rol staff.

### Clientes

`ClientesService` opera sobre `prisma.cliente`.

Implementado:

- Crear cliente administrativo.
- Listar clientes con paginacion, busqueda y estado.
- Obtener cliente por id.
- Actualizar cliente.
- Soft delete.
- Validacion de duplicados por correo, DNI y celular.
- DTOs sin contrasena.
- Respuestas sin credenciales.

### Mascotas

Implementado:

- `Mascota.cliente` apunta al modelo `Cliente`.
- Validacion de dueno mediante `prisma.cliente.findFirst`.
- Busqueda por datos del cliente administrativo.
- Relacion `clienteId` conservada.

### Citas

Implementado:

- `Cita.cliente` apunta al modelo `Cliente`.
- `clienteId` se deriva desde la mascota seleccionada.
- Veterinario se valida como `Usuario` activo con rol `VETERINARIO`.
- Respuestas incluyen `cliente`, `mascota`, `veterinario` e `historiaClinica`.
- `GET /api/usuarios/veterinarios` alimenta el selector de veterinarios con ids reales.
- El frontend usa select controlado para conservar el `veterinarioId` real seleccionado.

### Historias clinicas

Implementado:

- Historia clinica mantiene `veterinarioId` asociado a `Usuario`.
- Historia clinica mantiene `mascotaId`.
- Datos de dueno se resuelven desde `cita.cliente`.
- Validacion de veterinario por rol `VETERINARIO`.
- Reglas de cita completada, historia unica, cierre y reapertura se conservan.

### Contacto publico

El backend de contacto publico ya no participa en el flujo final.

`AppModule` no registra `ContactoModule`.

La migracion de Fase 09 elimina `mensajes_contacto` si existe.

---

## 4. Cambios frontend implementados

### Auth frontend

Implementado:

- `loginStaff`.
- `refrescarSesion`.
- `obtenerPerfil`.
- `cerrarSesionLocal`.
- Tipos de sesion con roles staff.
- Limpieza de cookie legacy `vetexpert_tipo_usuario` al guardar/cerrar sesion.

No existe en services:

- `loginCliente`.
- `registrarCliente`.
- Sesion con `CLIENTE`.
- Sesion con `tipoUsuario`.

### Rutas

Implementado:

- `/staff/login` como login staff.
- `/login` renderiza el mismo `AccesoForm` staff-only.
- `/recuperar` usa flujo de recuperacion staff.
- `/dashboard` protegido por proxy con token.

Observacion real:

- Existen carpetas vacias `frontend/src/app/portal` y `frontend/src/app/registro`.
- No tienen `page.tsx`, por lo tanto no exponen rutas funcionales.

### Dashboard

Implementado:

- Navegacion limitada a `ADMIN`, `SECRETARIA`, `VETERINARIO`.
- `DashboardShell` no incluye `CLIENTE`.
- Clientes visible para `ADMIN` y `SECRETARIA`.
- Mascotas y citas visibles para roles staff definidos.

### Clientes UI

Implementado:

- Payload de clientes sin contrasena.
- Formularios de clientes administrativos sin password.
- Gestion interna de clientes desde dashboard.

### Contacto publico

Implementado:

- `ContactForm` valida campos en frontend.
- Construye URL de WhatsApp con `encodeURIComponent`.
- Abre `https://api.whatsapp.com/send/?phone=51987551480&text=`.
- No llama a backend.
- No usa Prisma.
- No crea cliente ni usuario.

---

## 5. Cambios Prisma reales

`database/schema/schema.prisma` contiene:

- Enum `Rol` con `ADMIN`, `SECRETARIA`, `VETERINARIO`.
- Modelo `Usuario` staff-only.
- Modelo `Cliente` independiente.
- `Mascota.cliente -> Cliente`.
- `Cita.cliente -> Cliente`.
- `Cita.veterinario -> Usuario`.
- `HistoriaClinica.veterinario -> Usuario`.
- Sin enum `TipoUsuario`.
- Sin campo `tipoUsuario`.
- Sin modelo `MensajeContacto`.

Modelo `Cliente` actual:

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

---

## 6. Migracion creada

Migracion existente:

```text
database/schema/migrations/20260526000000_fase_09_staff_only
```

La migracion:

- Crea tabla `clientes`.
- Copia usuarios legacy con `tipo_usuario = 'CLIENTE'` hacia `clientes`.
- Preserva IDs legacy para conservar FKs de mascotas/citas.
- Reapunta FKs de `mascotas.cliente_id` y `citas.cliente_id` hacia `clientes`.
- Elimina refresh tokens y recuperaciones de usuarios cliente legacy.
- Elimina usuarios cliente legacy.
- Elimina tabla `mensajes_contacto` si existe.
- Elimina columna `tipo_usuario`.
- Elimina enum `TipoUsuario`.
- Recrea enum `Rol` sin `CLIENTE`.

---

## 7. Endpoints eliminados

Eliminados del contrato funcional:

- `POST /api/auth/clientes/login`.
- `POST /api/auth/clientes/registro`.
- `POST /api/contacto/mensajes`.

No se encontraron controladores backend activos para auth cliente ni contacto publico persistido.

---

## 8. Endpoints nuevos o consolidados

Nuevo/consolidado para citas:

- `GET /api/usuarios/veterinarios`.

Auth staff vigente:

- `POST /api/auth/staff/login`.
- `POST /api/auth/refresh`.
- `GET /api/auth/perfil`.
- `POST /api/auth/recuperar`.

Clientes administrativos vigentes:

- `GET /api/clientes`.
- `GET /api/clientes/:id`.
- `POST /api/clientes`.
- `PATCH /api/clientes/:id`.
- `DELETE /api/clientes/:id`.

---

## 9. Flujo actual de clientes administrativos

1. Staff autorizado ingresa al dashboard.
2. `ADMIN` o `SECRETARIA` crea o actualiza clientes.
3. El cliente se guarda en tabla `clientes`.
4. El cliente no recibe password ni credenciales.
5. El cliente puede asociarse a mascotas.
6. La eliminacion de cliente es logica.

---

## 10. Flujo actual mascotas/citas/historias

Mascotas:

- Se crean con `clienteId`.
- El backend valida que el cliente exista, este activo y no eliminado.

Citas:

- Se crean con `mascotaId` y `veterinarioId`.
- El backend deriva `clienteId` desde la mascota.
- El veterinario debe ser `Usuario` staff activo con rol `VETERINARIO`.

Historias clinicas:

- Se crean desde citas `COMPLETADA`.
- Derivan `mascotaId` y `veterinarioId` desde la cita.
- Muestran dueno mediante la relacion `cita.cliente`.

---

## 11. Riesgos pendientes

- Validar manualmente migracion con datos reales antes de produccion.
- Confirmar que no existan clientes legacy con correo/DNI/celular duplicado que rompan indices unicos.
- Confirmar integridad de `mascotas.cliente_id` y `citas.cliente_id` luego de migrar.
- Revisar directorios vacios de rutas legacy si se desea limpieza fisica posterior.
- Completar flujo real de recuperacion de contrasena staff si se requiere envio de correo.
- Endurecer proxy si se requiere validacion de rol desde cookie/token en middleware.

---

## 12. Deuda tecnica residual

- Fase 10 aun no implementa CRUD staff.
- `GET /api/usuarios/veterinarios` cubre solo listado de veterinarios para selects.
- `POST /api/auth/recuperar` genera registro de recuperacion, pero no hay flujo documentado de entrega/consumo del token.
- Documentos historicos de fases previas conservan referencias antiguas a cliente como usuario legacy.
- Carpetas vacias `portal` y `registro` pueden eliminarse en una limpieza posterior si se aprueba tocar estructura.

---

## 13. Validaciones manuales pendientes

Antes de cerrar operacionalmente en un entorno real:

- Login staff con `ADMIN`.
- Login staff con `SECRETARIA`.
- Login staff con `VETERINARIO`.
- Refresh token staff.
- Perfil staff.
- CRUD clientes administrativos.
- Crear/editar mascota con cliente administrativo.
- Crear cita derivando `clienteId`.
- Listar veterinarios desde `GET /api/usuarios/veterinarios`.
- Crear historia desde cita completada.
- Ver dueno en historia clinica.
- Enviar contacto publico y confirmar apertura de WhatsApp.
- Ejecutar typecheck backend.
- Ejecutar typecheck frontend.
- Probar migracion sobre copia de base real.

---

## 14. Estado final real de Fase 09

Fase 09 queda implementada a nivel de arquitectura y codigo existente:

- Sistema staff-only consolidado.
- Cliente autenticado eliminado.
- Cliente administrativo separado.
- Relaciones principales preservadas.
- Contacto publico fuera de Prisma.
- Preparada la base para Fase 10.

Fase 10 no fue implementada en esta fase.
