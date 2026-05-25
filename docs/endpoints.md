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

Pendiente implementación.