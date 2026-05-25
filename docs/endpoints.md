# Endpoints — VetExpert

# Auth

POST /api/auth/staff/login
POST /api/auth/clientes/login
POST /api/auth/clientes/registro
POST /api/auth/refresh
POST /api/auth/recuperar
GET /api/auth/perfil

---

# Contacto

POST /api/contacto/mensajes

---

# Clientes

GET /api/clientes
GET /api/clientes/:id
POST /api/clientes
PATCH /api/clientes/:id
DELETE /api/clientes/:id

---

# Mascotas

### GET /api/mascotas
Listar mascotas con paginación, búsqueda libre y filtros por especie, estado y clienteId.
* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Query Params**:
  * `pagina` (opcional, entero, default: 1)
  * `limite` (opcional, entero, default: 10)
  * `busqueda` (opcional, texto, busca en: nombre mascota, raza, nombres/apellidos/DNI del cliente)
  * `estado` (opcional, enum: `activos`, `inactivos`, `todos`, default: `activos`)
  * `especie` (opcional, enum: `PERRO`, `GATO`, `AVE`, `CONEJO`, `HAMSTER`, `REPTIL`, `PEZ`, `OTRO`)
  * `clienteId` (opcional, UUID)
* **Response (200 OK)**:
  ```json
  {
    "datos": [
      {
        "id": "uuid-mascota",
        "nombre": "Lucas",
        "especie": "PERRO",
        "raza": "Golden Retriever",
        "sexo": "MACHO",
        "fechaNacimiento": "2024-05-15T00:00:00.000Z",
        "peso": 28.5,
        "color": "Dorado",
        "esterilizado": true,
        "alergias": "Ninguna",
        "observaciones": "Muy juguetón",
        "fotoUrl": null,
        "activo": true,
        "clienteId": "uuid-cliente",
        "cliente": {
          "id": "uuid-cliente",
          "nombres": "Juan",
          "apellidos": "Pérez",
          "dni": "12345678"
        },
        "creadoEn": "2026-05-25T00:00:00.000Z",
        "actualizadoEn": "2026-05-25T00:00:00.000Z"
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

### GET /api/mascotas/:id
Obtener los detalles de una mascota específica por su ID.
* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Response (200 OK)**:
  ```json
  {
    "id": "uuid-mascota",
    "nombre": "Lucas",
    "especie": "PERRO",
    "raza": "Golden Retriever",
    "sexo": "MACHO",
    "fechaNacimiento": "2024-05-15T00:00:00.000Z",
    "peso": 28.5,
    "color": "Dorado",
    "esterilizado": true,
    "alergias": "Ninguna",
    "observaciones": "Muy juguetón",
    "fotoUrl": null,
    "activo": true,
    "clienteId": "uuid-cliente",
    "cliente": {
      "id": "uuid-cliente",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "dni": "12345678"
    },
    "creadoEn": "2026-05-25T00:00:00.000Z",
    "actualizadoEn": "2026-05-25T00:00:00.000Z"
  }
  ```

### POST /api/mascotas
Crear una nueva mascota en el sistema.
* **Roles permitidos**: `ADMIN`, `SECRETARIA`
* **Request Body**:
  ```json
  {
    "nombre": "Lucas",
    "especie": "PERRO",
    "raza": "Golden Retriever",
    "sexo": "MACHO",
    "fechaNacimiento": "2024-05-15T00:00:00.000Z",
    "peso": 28.5,
    "color": "Dorado",
    "esterilizado": true,
    "alergias": "Ninguna",
    "observaciones": "Muy juguetón",
    "clienteId": "uuid-cliente"
  }
  ```
* **Response (201 Created)**: Retorna el objeto de la mascota creada con la relación `cliente`.

### PATCH /api/mascotas/:id
Actualizar datos de una mascota de forma parcial.
* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Request Body**: Datos opcionales del modelo de mascota para modificar.
* **Response (200 OK)**: Retorna el objeto de la mascota actualizada con la relación `cliente`.

### DELETE /api/mascotas/:id
Eliminación lógica (soft delete) de una mascota del sistema.
* **Roles permitidos**: `ADMIN`, `SECRETARIA`
* **Response (200 OK)**:
  ```json
  {
    "mensaje": "Mascota eliminada correctamente."
  }
  ```

---

# Citas

Modulo de gestion de citas con JWT, roles, filtros, paginacion y soft delete.

## Estados disponibles

* `PENDIENTE`
* `CONFIRMADA`
* `COMPLETADA`
* `CANCELADA`

## Roles y permisos

* `ADMIN`: CRUD completo.
* `SECRETARIA`: CRUD completo.
* `VETERINARIO`: lectura y actualizacion parcial de su propia agenda. Solo puede actualizar `observaciones` y cambiar `estado` a `COMPLETADA` o `CANCELADA`.

## Reglas de negocio implementadas

* La fecha de la cita no puede ser pasada al crear o reprogramar.
* La mascota debe existir, estar activa y no estar eliminada logicamente.
* El veterinario debe existir, estar activo, no estar eliminado, tener `tipoUsuario: STAFF` y `rol: VETERINARIO`.
* El `clienteId` no se recibe desde el frontend: se asigna automaticamente desde la mascota seleccionada.
* Se evita doble reserva exacta del veterinario validando `veterinarioId + fecha` en citas no eliminadas.
* La eliminacion es logica mediante `eliminadoEn`.

### GET /api/citas
Listar citas con paginacion, busqueda libre y filtros.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Comportamiento por rol**:
  * `ADMIN` y `SECRETARIA`: pueden ver todas las citas.
  * `VETERINARIO`: el backend limita la consulta a su propio `veterinarioId`.
* **Query Params**:
  * `pagina` (opcional, entero, default: 1)
  * `limite` (opcional, entero, default: 10, max: 50)
  * `busqueda` (opcional, texto, busca en motivo, observaciones, mascota, cliente y veterinario)
  * `estado` (opcional, enum: `PENDIENTE`, `CONFIRMADA`, `COMPLETADA`, `CANCELADA`)
  * `veterinarioId` (opcional, UUID)
  * `clienteId` (opcional, UUID)
  * `mascotaId` (opcional, UUID)
  * `fechaInicio` (opcional, ISO date string)
  * `fechaFin` (opcional, ISO date string)
* **Ejemplo request**:
  ```http
  GET /api/citas?pagina=1&limite=10&estado=CONFIRMADA&fechaInicio=2026-05-25T00:00:00.000Z&fechaFin=2026-05-31T23:59:59.000Z
  ```
* **Response (200 OK)**:
  ```json
  {
    "datos": [
      {
        "id": "uuid-cita",
        "fecha": "2026-05-26T15:30:00.000Z",
        "motivo": "Control general",
        "observaciones": "Paciente estable.",
        "estado": "CONFIRMADA",
        "mascotaId": "uuid-mascota",
        "veterinarioId": "uuid-veterinario",
        "clienteId": "uuid-cliente",
        "mascota": {
          "id": "uuid-mascota",
          "nombre": "Lucas",
          "especie": "PERRO",
          "raza": "Golden Retriever"
        },
        "veterinario": {
          "id": "uuid-veterinario",
          "nombres": "Ana",
          "apellidos": "Torres",
          "correo": "ana.torres@vetexpert.com"
        },
        "cliente": {
          "id": "uuid-cliente",
          "nombres": "Juan",
          "apellidos": "Perez",
          "dni": "12345678",
          "celular": "987654321"
        },
        "creadoEn": "2026-05-25T10:00:00.000Z",
        "actualizadoEn": "2026-05-25T10:00:00.000Z"
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

### GET /api/citas/:id
Obtener el detalle de una cita especifica.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Comportamiento por rol**:
  * `ADMIN` y `SECRETARIA`: pueden ver cualquier cita no eliminada.
  * `VETERINARIO`: solo puede ver citas asignadas a su usuario.
* **Response (200 OK)**:
  ```json
  {
    "id": "uuid-cita",
    "fecha": "2026-05-26T15:30:00.000Z",
    "motivo": "Control general",
    "observaciones": "Paciente estable.",
    "estado": "CONFIRMADA",
    "mascotaId": "uuid-mascota",
    "veterinarioId": "uuid-veterinario",
    "clienteId": "uuid-cliente",
    "mascota": {
      "id": "uuid-mascota",
      "nombre": "Lucas",
      "especie": "PERRO",
      "raza": "Golden Retriever"
    },
    "veterinario": {
      "id": "uuid-veterinario",
      "nombres": "Ana",
      "apellidos": "Torres",
      "correo": "ana.torres@vetexpert.com"
    },
    "cliente": {
      "id": "uuid-cliente",
      "nombres": "Juan",
      "apellidos": "Perez",
      "dni": "12345678",
      "celular": "987654321"
    },
    "creadoEn": "2026-05-25T10:00:00.000Z",
    "actualizadoEn": "2026-05-25T10:00:00.000Z"
  }
  ```

### POST /api/citas
Crear una nueva cita.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`
* **Request Body**:
  ```json
  {
    "fecha": "2026-05-26T15:30:00.000Z",
    "motivo": "Control general",
    "observaciones": "Primera visita del paciente.",
    "estado": "PENDIENTE",
    "mascotaId": "uuid-mascota",
    "veterinarioId": "uuid-veterinario"
  }
  ```
* **Notas**:
  * `estado` es opcional; si no se envia, el backend usa `PENDIENTE`.
  * `clienteId` no debe enviarse; se obtiene desde la mascota.
* **Response (201 Created)**: retorna el objeto de cita creado con relaciones `mascota`, `veterinario` y `cliente`.

### PATCH /api/citas/:id
Actualizar una cita de forma parcial.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Permisos por rol**:
  * `ADMIN` y `SECRETARIA`: pueden modificar fecha, motivo, observaciones, estado, mascota y veterinario.
  * `VETERINARIO`: solo puede modificar `observaciones` y `estado`; el estado permitido es `COMPLETADA` o `CANCELADA`.
* **Request Body ADMIN/SECRETARIA**:
  ```json
  {
    "fecha": "2026-05-26T16:00:00.000Z",
    "motivo": "Control general reprogramado",
    "observaciones": "Cliente solicito mover la hora.",
    "estado": "CONFIRMADA",
    "mascotaId": "uuid-mascota",
    "veterinarioId": "uuid-veterinario"
  }
  ```
* **Request Body VETERINARIO**:
  ```json
  {
    "estado": "COMPLETADA",
    "observaciones": "Evaluacion finalizada sin incidencias."
  }
  ```
* **Response (200 OK)**: retorna el objeto de cita actualizado con relaciones `mascota`, `veterinario` y `cliente`.

### DELETE /api/citas/:id
Eliminacion logica de una cita.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`
* **Response (200 OK)**:
  ```json
  {
    "mensaje": "Cita eliminada correctamente."
  }
  ```

---

# Historias Clinicas

Modulo de historial medico generado exclusivamente desde citas `COMPLETADA`.

## Roles y permisos

* `ADMIN`: acceso completo.
* `VETERINARIO`: puede crear, editar y cerrar historias de sus propias citas.
* `SECRETARIA`: solo lectura.

## Reglas de negocio implementadas

* Solo se puede crear una historia clinica desde una cita `COMPLETADA`.
* No se permite mas de una historia clinica activa por cita.
* `mascotaId` y `veterinarioId` se derivan automaticamente desde la cita.
* La cita debe existir y no estar eliminada.
* La mascota asociada debe estar activa y no eliminada.
* El veterinario asociado debe estar activo, no eliminado, ser `STAFF` y tener rol `VETERINARIO`.
* Una historia cerrada no puede editarse.
* Solo `ADMIN` puede reabrir historias cerradas.
* La eliminacion es logica mediante `eliminadoEn`.

### GET /api/historias-clinicas
Listar historias clinicas con paginacion, busqueda libre y filtros.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Query Params**:
  * `pagina` (opcional, entero, default: 1)
  * `limite` (opcional, entero, default: 10, max: 50)
  * `busqueda` (opcional, texto)
  * `mascotaId` (opcional, UUID)
  * `veterinarioId` (opcional, UUID)
  * `citaId` (opcional, UUID)
  * `fechaInicio` (opcional, ISO date string)
  * `fechaFin` (opcional, ISO date string)
  * `cerrada` (opcional, boolean)
* **Response (200 OK)**:
  ```json
  {
    "datos": [
      {
        "id": "uuid-historia",
        "fecha": "2026-05-25T15:30:00.000Z",
        "diagnostico": "Dermatitis leve",
        "tratamiento": "Tratamiento topico por 7 dias",
        "observaciones": "Control en una semana",
        "cerrada": false,
        "citaId": "uuid-cita",
        "mascotaId": "uuid-mascota",
        "veterinarioId": "uuid-veterinario",
        "creadoEn": "2026-05-25T16:00:00.000Z",
        "actualizadoEn": "2026-05-25T16:00:00.000Z"
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

### GET /api/historias-clinicas/mascota/:mascotaId
Listar historias clinicas cronologicas de una mascota.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Response (200 OK)**:
  ```json
  {
    "datos": [
      {
        "id": "uuid-historia",
        "fecha": "2026-05-25T15:30:00.000Z",
        "diagnostico": "Dermatitis leve",
        "tratamiento": "Tratamiento topico por 7 dias",
        "cerrada": true
      }
    ]
  }
  ```

### GET /api/historias-clinicas/:id
Obtener detalle de historia clinica por ID.

* **Roles permitidos**: `ADMIN`, `SECRETARIA`, `VETERINARIO`
* **Response (200 OK)**: Retorna la historia clinica con relaciones de cita, mascota y veterinario.

### POST /api/historias-clinicas/cita/:citaId
Crear una historia clinica desde una cita completada.

* **Roles permitidos**: `ADMIN`, `VETERINARIO`
* **Request Body**:
  ```json
  {
    "diagnostico": "Dermatitis leve",
    "tratamiento": "Tratamiento topico por 7 dias",
    "observaciones": "Control en una semana",
    "cerrada": false
  }
  ```
* **Response (201 Created)**: Retorna la historia clinica creada.

### PATCH /api/historias-clinicas/:id
Actualizar una historia clinica abierta.

* **Roles permitidos**: `ADMIN`, `VETERINARIO`
* **Request Body**:
  ```json
  {
    "diagnostico": "Dermatitis controlada",
    "tratamiento": "Extender tratamiento por 3 dias",
    "observaciones": "Buena evolucion"
  }
  ```
* **Response (200 OK)**: Retorna la historia clinica actualizada.

### PATCH /api/historias-clinicas/:id/cerrar
Cerrar una historia clinica.

* **Roles permitidos**: `ADMIN`, `VETERINARIO`
* **Response (200 OK)**: Retorna la historia clinica con `cerrada: true`.

### PATCH /api/historias-clinicas/:id/reabrir
Reabrir una historia clinica cerrada.

* **Roles permitidos**: `ADMIN`
* **Response (200 OK)**: Retorna la historia clinica con `cerrada: false`.

### DELETE /api/historias-clinicas/:id
Eliminacion logica de una historia clinica.

* **Roles permitidos**: `ADMIN`
* **Response (200 OK)**:
  ```json
  {
    "mensaje": "Historia clinica eliminada correctamente."
  }
  ```
