# Endpoints - VetExpert

VetExpert es un sistema administrativo/staff-only.

Roles activos:

- `ADMIN`
- `VETERINARIO`
- `SECRETARIA`

Los clientes son registros administrativos internos. No existen endpoints de login, registro ni refresh para clientes.

---

## Auth

Endpoints implementados:

- `GET /api/auth/estado`
- `POST /api/auth/staff/login`
- `POST /api/auth/refresh`
- `POST /api/auth/recuperar`
- `GET /api/auth/perfil`

Reglas actuales:

- `POST /api/auth/staff/login` autentica solo usuarios staff activos.
- `POST /api/auth/refresh` rota refresh tokens solo si pertenecen a staff activo.
- `GET /api/auth/perfil` requiere JWT y devuelve `id`, `correo` y `rol`.
- El JWT no incluye `tipoUsuario`.
- No se emiten tokens para clientes administrativos.
- `POST /api/auth/recuperar` esta filtrado a roles staff. El flujo de entrega de instrucciones queda pendiente de completarse.

Endpoints eliminados del contrato:

- `POST /api/auth/clientes/login`
- `POST /api/auth/clientes/registro`

---

## Usuarios

Endpoints implementados:

- `GET /api/usuarios/estado`
- `GET /api/usuarios/veterinarios`

### GET /api/usuarios/veterinarios

Lista veterinarios activos para selects internos, como citas.

Roles permitidos:

- `ADMIN`
- `SECRETARIA`
- `VETERINARIO`

Respuesta:

```json
[
  {
    "id": "uuid-veterinario",
    "nombres": "Ana",
    "apellidos": "Torres",
    "correo": "ana.torres@vetexpert.com",
    "celular": "987654321",
    "activo": true
  }
]
```

La gestion completa de staff esta implementada en `/api/staff`. Este endpoint auxiliar se mantiene para selects internos y debe seguir compatible con citas.

---

## Clientes

Clientes representa duenos de mascotas como registros administrativos internos. No son cuentas autenticables.

Endpoints implementados:

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PATCH /api/clientes/:id`
- `DELETE /api/clientes/:id`

Roles permitidos:

- `ADMIN`
- `SECRETARIA`

Reglas actuales:

- Opera sobre modelo Prisma `Cliente`.
- No recibe ni devuelve password.
- No crea usuarios.
- No asigna rol.
- No genera JWT.
- Mantiene soft delete con `eliminadoEn`.
- Valida duplicados por correo, DNI y celular.

### GET /api/clientes

Query params:

- `pagina` opcional.
- `limite` opcional.
- `busqueda` opcional.
- `estado` opcional: `activos`, `inactivos`, `todos`.

### POST /api/clientes

Request body:

```json
{
  "nombres": "Juan",
  "apellidos": "Perez",
  "dni": "12345678",
  "celular": "987654321",
  "correo": "juan.perez@correo.com",
  "direccion": "Av. Principal 123",
  "activo": true
}
```

---

## Mascotas

Endpoints implementados:

- `GET /api/mascotas`
- `GET /api/mascotas/:id`
- `POST /api/mascotas`
- `PATCH /api/mascotas/:id`
- `DELETE /api/mascotas/:id`

Roles:

- Lectura: `ADMIN`, `SECRETARIA`, `VETERINARIO`.
- Crear/eliminar: `ADMIN`, `SECRETARIA`.
- Actualizar: `ADMIN`, `SECRETARIA`, `VETERINARIO`.

Reglas actuales:

- `clienteId` debe pertenecer a un `Cliente` activo y no eliminado.
- Las respuestas incluyen resumen del cliente administrativo.
- La busqueda puede usar nombre de mascota, raza, nombres/apellidos/DNI del cliente.
- La eliminacion es logica.

Query params en listado:

- `pagina`
- `limite`
- `busqueda`
- `estado`
- `especie`
- `clienteId`

---

## Citas

Endpoints implementados:

- `GET /api/citas`
- `GET /api/citas/:id`
- `POST /api/citas`
- `PATCH /api/citas/:id`
- `DELETE /api/citas/:id`

Roles:

- `ADMIN`: CRUD completo.
- `SECRETARIA`: CRUD completo.
- `VETERINARIO`: lectura de su agenda y actualizacion limitada.

Reglas actuales:

- La fecha no puede ser pasada al crear o reprogramar.
- La mascota debe existir, estar activa y no eliminada.
- El veterinario debe ser un `Usuario` activo con rol `VETERINARIO`.
- `clienteId` no se recibe desde el frontend; se deriva desde la mascota.
- Se evita doble reserva exacta por `veterinarioId + fecha`.
- El veterinario solo puede actualizar `observaciones` y `estado`.
- Estados permitidos para veterinario: `COMPLETADA`, `CANCELADA`.
- Las respuestas incluyen `mascota`, `cliente`, `veterinario` e indicador de `historiaClinica`.

Query params en listado:

- `pagina`
- `limite`
- `busqueda`
- `estado`
- `veterinarioId`
- `clienteId`
- `mascotaId`
- `fechaInicio`
- `fechaFin`

---

## Historias Clinicas

Endpoints implementados:

- `GET /api/historias-clinicas`
- `GET /api/historias-clinicas/mascota/:mascotaId`
- `GET /api/historias-clinicas/:id`
- `POST /api/historias-clinicas/cita/:citaId`
- `PATCH /api/historias-clinicas/:id`
- `PATCH /api/historias-clinicas/:id/cerrar`
- `PATCH /api/historias-clinicas/:id/reabrir`
- `DELETE /api/historias-clinicas/:id`

Roles:

- `ADMIN`: acceso completo.
- `VETERINARIO`: lectura y escritura sobre sus propias citas/historias.
- `SECRETARIA`: lectura.

Reglas actuales:

- Solo se puede crear desde una cita `COMPLETADA`.
- No se permite mas de una historia clinica por cita.
- `mascotaId` y `veterinarioId` se derivan desde la cita.
- La mascota asociada debe estar activa y no eliminada.
- El veterinario asociado debe ser staff activo con rol `VETERINARIO`.
- Una historia cerrada no puede editarse.
- Solo `ADMIN` puede reabrir.
- Solo `ADMIN` puede eliminar.
- La eliminacion es logica.

---

## Contacto publico

No hay endpoint backend activo para contacto publico en el contrato actual.

El formulario publico del frontend construye una URL de WhatsApp:

```text
https://api.whatsapp.com/send/?phone=51987551480&text={mensajeCodificado}
```

Reglas actuales:

- No llama a `/api/contacto/mensajes`.
- No crea `Cliente`.
- No crea `Usuario`.
- No usa Prisma.
- No genera sesiones.
- No genera JWT.

El endpoint heredado `POST /api/contacto/mensajes` fue retirado del flujo final. La migracion de Fase 09 elimina la tabla `mensajes_contacto` si existe.

---

## Staff

Gestion administrativa de usuarios internos staff.

Endpoints implementados:

- `GET /api/staff`
- `GET /api/staff/:id`
- `POST /api/staff`
- `PATCH /api/staff/:id`
- `PATCH /api/staff/:id/activar`
- `PATCH /api/staff/:id/inactivar`

Roles permitidos:

- `ADMIN`

Reglas actuales:

- Solo `ADMIN` puede crear, editar, activar o inactivar staff.
- Roles gestionables: `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- No debe existir registro publico de staff.
- No devuelve `passwordHash`.
- No devuelve refresh tokens.
- Crear staff hashea la contrasena inicial con bcryptjs.
- Valida correo unico.
- Valida DNI unico si se envia.
- Valida celular unico si se envia.
- Listado con paginacion, busqueda, filtro por rol y filtro por estado.
- Activar/inactivar no hace soft delete.
- No se puede inactivar el ultimo `ADMIN` activo.
- No se puede degradar el ultimo `ADMIN` activo.
- No se puede auto-inactivar el admin autenticado.
- Al inactivar staff se revocan refresh tokens activos.
- Access tokens de staff inactivo son rechazados por `JwtStrategy`.
- Login y refresh siguen reservados a staff activo.

### GET /api/staff

Query params:

- `pagina` opcional.
- `limite` opcional.
- `busqueda` opcional.
- `rol` opcional: `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- `estado` opcional: `activos`, `inactivos`, `todos`.

Respuesta:

```json
{
  "datos": [
    {
      "id": "uuid-staff",
      "nombres": "Ana",
      "apellidos": "Torres",
      "correo": "ana.torres@vetexpert.com",
      "dni": "12345678",
      "celular": "987654321",
      "direccion": "Av. Principal 123",
      "rol": "VETERINARIO",
      "activo": true,
      "ultimoAccesoEn": null,
      "creadoEn": "2026-05-26T00:00:00.000Z",
      "actualizadoEn": "2026-05-26T00:00:00.000Z",
      "eliminadoEn": null
    }
  ],
  "meta": {
    "pagina": 1,
    "limite": 10,
    "total": 1,
    "totalPaginas": 1
  }
}
```

### POST /api/staff

Request body:

```json
{
  "nombres": "Ana",
  "apellidos": "Torres",
  "correo": "ana.torres@vetexpert.com",
  "dni": "12345678",
  "celular": "987654321",
  "direccion": "Av. Principal 123",
  "rol": "VETERINARIO",
  "contrasena": "Temporal123*",
  "activo": true
}
```

### PATCH /api/staff/:id

Actualiza datos administrativos y rol. No actualiza password ni estado activo.

### PATCH /api/staff/:id/activar

Activa un usuario staff.

### PATCH /api/staff/:id/inactivar

Inactiva un usuario staff y revoca sus refresh tokens activos. Aplica reglas anti-bloqueo de administradores.
