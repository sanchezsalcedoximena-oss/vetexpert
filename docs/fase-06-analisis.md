# Fase 06 — Análisis Técnico: Gestión de Mascotas

## Resumen

Este documento detalla la planificación técnica del módulo de mascotas para VetExpert.
Se basa en el análisis completo de la arquitectura existente y replica los patrones
establecidos en el módulo de clientes (Fase 05), adaptados al dominio de mascotas
veterinarias.

---

## 1. Modelo Prisma Recomendado

### Nuevo modelo `Mascota`

```prisma
model Mascota {
  id              String    @id @default(uuid()) @db.Uuid
  nombre          String
  especie         String
  raza            String?
  sexo            String
  fechaNacimiento DateTime? @map("fecha_nacimiento")
  peso            Decimal?  @db.Decimal(6, 2)
  color           String?
  esterilizado    Boolean   @default(false)
  alergias        String?
  observaciones   String?
  fotoUrl         String?   @map("foto_url")
  activo          Boolean   @default(true)
  clienteId       String    @map("cliente_id") @db.Uuid
  creadoEn        DateTime  @default(now()) @map("creado_en")
  actualizadoEn   DateTime  @updatedAt @map("actualizado_en")
  eliminadoEn     DateTime? @map("eliminado_en")
  cliente         Usuario   @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@index([clienteId])
  @@map("mascotas")
}
```

### Justificación de campos

| Campo | Tipo | Justificación |
|-------|------|---------------|
| `id` | UUID | Consistente con todos los modelos existentes |
| `nombre` | String | Obligatorio — nombre de la mascota |
| `especie` | String | Obligatorio — perro, gato, ave, etc. |
| `raza` | String? | Opcional — no siempre se conoce la raza |
| `sexo` | String | Obligatorio — "MACHO" o "HEMBRA" |
| `fechaNacimiento` | DateTime? | Opcional — reemplaza "edad" para cálculo dinámico y mayor precisión |
| `peso` | Decimal(6,2) | Opcional — peso en kg, hasta 9999.99 kg |
| `color` | String? | Opcional — color del pelaje/plumaje |
| `esterilizado` | Boolean | Default false — estado de esterilización |
| `alergias` | String? | Opcional — texto libre para alergias conocidas |
| `observaciones` | String? | Opcional — notas adicionales del veterinario |
| `fotoUrl` | String? | Opcional — preparado para subida futura de foto |
| `activo` | Boolean | Default true — control de estado activo/inactivo |
| `clienteId` | UUID | Obligatorio — relación con el dueño (Usuario tipo CLIENTE) |
| `eliminadoEn` | DateTime? | Soft delete — consistente con patrón de clientes |

### Decisión: `fechaNacimiento` en lugar de `edad`

Se recomienda almacenar `fechaNacimiento` en lugar de `edad` porque:

1. La edad cambia con el tiempo, `fechaNacimiento` es inmutable.
2. Se puede calcular la edad dinámica en el frontend o backend.
3. Evita inconsistencias por datos desactualizados.
4. Es la práctica estándar en sistemas veterinarios.

Si prefieres mantener `edad` como número entero (campo simple sin cálculo), se puede ajustar.

---

## 2. Relaciones Prisma Necesarias

### Modificación al modelo `Usuario`

```prisma
model Usuario {
  // ... campos existentes sin cambios ...
  mascotas        Mascota[]   // <-- nueva relación

  @@map("usuarios")
}
```

### Diagrama de relación

```
Usuario (CLIENTE) 1 ───── N Mascota
         clienteId ◄──────── cliente
```

- Un cliente puede tener muchas mascotas.
- Una mascota pertenece a exactamente un cliente.
- `onDelete: Cascade` — si se elimina el cliente, se eliminan sus mascotas.
- Índice en `clienteId` para búsquedas eficientes.

---

## 3. Estructura Backend — Módulo Mascotas

### Archivos a crear/modificar

```
backend/src/mascotas/
├── mascotas.controller.ts    ← MODIFICAR (reemplazar stub actual)
├── mascotas.module.ts        ← MODIFICAR (ya existe, mantener estructura)
├── mascotas.service.ts       ← MODIFICAR (reemplazar stub actual)
└── dto/
    ├── crear-mascota.dto.ts       ← NUEVO
    ├── actualizar-mascota.dto.ts  ← NUEVO
    └── listar-mascotas.dto.ts     ← NUEVO
```

### Patrón replicado de Clientes

El módulo seguirá exactamente el mismo patrón que `backend/src/clientes/`:

- **Controller**: Solo maneja request/response, delega al service.
- **Service**: Toda la lógica de negocio.
- **DTOs**: Separados en crear, actualizar y listar.
- **Module**: Registra controller, providers y exports.

---

## 4. Endpoints REST

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/mascotas` | Listar mascotas con paginación, búsqueda y filtros | ADMIN, SECRETARIA, VETERINARIO |
| `GET` | `/api/mascotas/:id` | Obtener mascota por ID con datos del cliente | ADMIN, SECRETARIA, VETERINARIO |
| `POST` | `/api/mascotas` | Crear nueva mascota | ADMIN, SECRETARIA |
| `PATCH` | `/api/mascotas/:id` | Actualizar mascota | ADMIN, SECRETARIA, VETERINARIO |
| `DELETE` | `/api/mascotas/:id` | Soft delete mascota | ADMIN, SECRETARIA |

### Diferencias con Clientes

- **VETERINARIO** puede ver y actualizar mascotas (necesario para consultas), pero **no puede crear ni eliminar**.
- El `GET /api/mascotas` permite filtrar por `clienteId` para ver mascotas de un cliente específico.
- El `GET /api/mascotas/:id` incluye datos básicos del cliente (nombre, DNI) en la respuesta.

---

## 5. DTOs Necesarios

### `crear-mascota.dto.ts`

```typescript
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class CrearMascotaDto {
  @IsString({ message: "El nombre es obligatorio." })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(60, { message: "El nombre no debe superar 60 caracteres." })
  nombre!: string;

  @IsIn(["PERRO", "GATO", "AVE", "CONEJO", "HAMSTER", "REPTIL", "PEZ", "OTRO"], {
    message: "La especie no es válida."
  })
  especie!: string;

  @IsOptional()
  @IsString({ message: "La raza no es válida." })
  @MaxLength(60, { message: "La raza no debe superar 60 caracteres." })
  raza?: string;

  @IsIn(["MACHO", "HEMBRA"], { message: "El sexo debe ser MACHO o HEMBRA." })
  sexo!: string;

  @IsOptional()
  @IsDateString({}, { message: "La fecha de nacimiento no es válida." })
  fechaNacimiento?: string;

  @IsOptional()
  @IsNumber({}, { message: "El peso debe ser un número." })
  @Min(0.01, { message: "El peso debe ser mayor a 0." })
  peso?: number;

  @IsOptional()
  @IsString({ message: "El color no es válido." })
  @MaxLength(40, { message: "El color no debe superar 40 caracteres." })
  color?: string;

  @IsOptional()
  @IsBoolean({ message: "El campo esterilizado no es válido." })
  esterilizado?: boolean;

  @IsOptional()
  @IsString({ message: "Las alergias no son válidas." })
  @MaxLength(300, { message: "Las alergias no deben superar 300 caracteres." })
  alergias?: string;

  @IsOptional()
  @IsString({ message: "Las observaciones no son válidas." })
  @MaxLength(500, { message: "Las observaciones no deben superar 500 caracteres." })
  observaciones?: string;

  @IsUUID("4", { message: "El cliente seleccionado no es válido." })
  clienteId!: string;

  @IsOptional()
  @IsBoolean({ message: "El estado activo no es válido." })
  activo?: boolean;
}
```

### `actualizar-mascota.dto.ts`

Todos los campos del DTO de creación como opcionales (excepto `clienteId` que también será opcional para permitir reasignación).

### `listar-mascotas.dto.ts`

```typescript
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class ListarMascotasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "La página debe ser un número entero." })
  @Min(1, { message: "La página mínima es 1." })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "El límite debe ser un número entero." })
  @Min(1, { message: "El límite mínimo es 1." })
  @Max(50, { message: "El límite máximo es 50." })
  limite?: number = 10;

  @IsOptional()
  @IsString({ message: "La búsqueda no es válida." })
  busqueda?: string;

  @IsOptional()
  @IsIn(["todos", "activos", "inactivos"], { message: "El filtro de estado no es válido." })
  estado?: "todos" | "activos" | "inactivos" = "activos";

  @IsOptional()
  @IsIn(["PERRO", "GATO", "AVE", "CONEJO", "HAMSTER", "REPTIL", "PEZ", "OTRO"], {
    message: "El filtro de especie no es válido."
  })
  especie?: string;

  @IsOptional()
  @IsUUID("4", { message: "El filtro de cliente no es válido." })
  clienteId?: string;
}
```

---

## 6. Validaciones

### Backend (class-validator)

| Campo | Validación |
|-------|-----------|
| `nombre` | String, min 2, max 60, obligatorio |
| `especie` | Enum cerrado: PERRO, GATO, AVE, CONEJO, HAMSTER, REPTIL, PEZ, OTRO |
| `raza` | String opcional, max 60 |
| `sexo` | Enum cerrado: MACHO, HEMBRA |
| `fechaNacimiento` | DateString opcional, no puede ser fecha futura (validar en service) |
| `peso` | Number opcional, mayor a 0 |
| `color` | String opcional, max 40 |
| `esterilizado` | Boolean opcional, default false |
| `alergias` | String opcional, max 300 |
| `observaciones` | String opcional, max 500 |
| `clienteId` | UUID v4 obligatorio, debe existir un cliente activo con ese ID |
| `activo` | Boolean opcional, default true |

### Frontend (Zod)

Mismas reglas replicadas con Zod en `frontend/src/validators/mascota.ts` (o inline en el componente, como en clientes).

### Validaciones de negocio (en service)

1. `clienteId` debe pertenecer a un Usuario con `tipoUsuario: "CLIENTE"`, `eliminadoEn: null`.
2. `fechaNacimiento` no puede ser fecha futura.
3. No se permite crear mascotas duplicadas con mismo nombre + mismo clienteId (validación de duplicados opcional).

---

## 7. Estructura Frontend — Módulo Mascotas

### Archivos a crear/modificar

```
frontend/src/
├── services/
│   └── mascotas.ts                          ← NUEVO
├── modules/
│   └── mascotas/
│       └── components/
│           └── MascotasPage.tsx             ← NUEVO
├── app/
│   └── dashboard/
│       └── mascotas/
│           └── page.tsx                     ← MODIFICAR (reemplazar placeholder)
```

### `frontend/src/services/mascotas.ts`

Seguirá el patrón exacto de `services/clientes.ts`:

```typescript
// Tipos
export type Mascota = {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string;
  fechaNacimiento: string | null;
  peso: number | null;
  color: string | null;
  esterilizado: boolean;
  alergias: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  activo: boolean;
  clienteId: string;
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string | null;
  };
  creadoEn: string;
  actualizadoEn: string;
};

export type MascotasMeta = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

export type MascotasQuery = {
  pagina: number;
  limite: number;
  busqueda?: string;
  estado?: "todos" | "activos" | "inactivos";
  especie?: string;
  clienteId?: string;
};

export type MascotaPayload = {
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  fechaNacimiento?: string;
  peso?: number;
  color?: string;
  esterilizado?: boolean;
  alergias?: string;
  observaciones?: string;
  clienteId: string;
  activo?: boolean;
};

// Funciones API
export async function listarMascotas(query: MascotasQuery) { ... }
export async function obtenerMascota(id: string) { ... }
export async function crearMascota(payload: MascotaPayload) { ... }
export async function actualizarMascota(id: string, payload: Partial<MascotaPayload>) { ... }
export async function eliminarMascota(id: string) { ... }
```

### `MascotasPage.tsx` — Componentes internos

Siguiendo el patrón de `ClientesPage.tsx` (componentes en un solo archivo):

| Componente | Descripción |
|------------|-------------|
| `MascotasPage` | Componente principal con estado, búsqueda, filtros, paginación |
| `MascotasTable` | Tabla responsive desktop + cards mobile |
| `Acciones` | Botones ver, editar, eliminar por fila |
| `MascotaModal` | Modal crear/editar con validación Zod |
| `DetalleMascota` | Drawer lateral con información completa |
| `EstadoBadge` | Badge activo/inactivo (reutilizar patrón existente) |
| `EspecieBadge` | Badge con icono/emoji por especie |
| `ToastView` | Toast de éxito/error (reutilizar patrón existente) |

---

## 8. Flujo Frontend/Backend

### Flujo de listado

```
MascotasPage monta
  → useEffect con debounce 250ms
  → GET /api/mascotas?pagina=1&limite=10&estado=activos
  → Backend valida ListarMascotasDto
  → Prisma query con where, orderBy, skip, take, select
  → Incluye cliente { nombres, apellidos, dni }
  → Respuesta: { datos: Mascota[], meta: MascotasMeta }
  → Render tabla/cards
```

### Flujo de creación

```
Click "Nueva mascota"
  → Abrir MascotaModal modo="crear"
  → Cargar lista de clientes para selector
  → Usuario llena formulario
  → Validación Zod frontend
  → POST /api/mascotas con payload
  → Backend valida CrearMascotaDto
  → Backend valida clienteId existe y es cliente activo
  → Backend valida fechaNacimiento no es futura
  → Prisma create con select
  → Respuesta mascota creada
  → Toast "Mascota creada."
  → Recargar listado
```

### Flujo de edición

```
Click icono editar
  → Abrir MascotaModal modo="editar" con datos precargados
  → Usuario modifica campos
  → Validación Zod frontend
  → PATCH /api/mascotas/:id con payload parcial
  → Backend valida ActualizarMascotaDto
  → Backend valida existencia y datos
  → Prisma update con select
  → Toast "Mascota actualizada."
  → Recargar listado
```

### Flujo de eliminación (soft delete)

```
Click icono eliminar
  → Confirmación window.confirm()
  → DELETE /api/mascotas/:id
  → Backend marca eliminadoEn = new Date(), activo = false
  → Toast "Mascota eliminada correctamente."
  → Recargar listado
```

---

## 9. Estrategia de Paginación y Filtros

### Paginación

Idéntica al patrón de clientes:

- **Tipo**: Offset-based (skip/take).
- **Default**: página 1, límite 10.
- **Máximo**: límite 50 por request.
- **Respuesta meta**: `{ pagina, limite, total, totalPaginas }`.
- **Cálculo**: `totalPaginas = Math.max(1, Math.ceil(total / limite))`.

### Filtros disponibles

| Filtro | Tipo | Default |
|--------|------|---------|
| `busqueda` | Texto libre | — |
| `estado` | "activos" / "inactivos" / "todos" | "activos" |
| `especie` | PERRO, GATO, AVE, etc. | todos |
| `clienteId` | UUID | todos |

### Búsqueda

La búsqueda libre aplica en los siguientes campos (con `contains` + `mode: "insensitive"`):

- `nombre` de la mascota
- `raza` de la mascota
- `cliente.nombres` (join)
- `cliente.apellidos` (join)
- `cliente.dni` (join)

### Debounce

Búsqueda con debounce de 250ms (consistente con clientes).

---

## 10. Estrategia UX/UI

### Diseño visual

- **Consistente** con el módulo de clientes existente.
- Mismos tokens de color: `primario`, `secundario`, `exito`, `borde`, `superficie`, `fondo`, `texto`.
- Dark mode funcional heredado del dashboard.
- Framer Motion para animaciones de modal, drawer y toast.

### Tabla responsive

- **Desktop (lg+)**: tabla HTML con columnas: Mascota (nombre + especie), Dueño, Raza, Sexo, Estado, Acciones.
- **Mobile**: cards apiladas con la información principal y acciones.

### Columnas de la tabla desktop

| Columna | Contenido |
|---------|-----------|
| Mascota | Nombre + badge especie + emoji |
| Dueño | Nombres + apellidos del cliente |
| Raza | Raza o "-" si no tiene |
| Sexo | MACHO / HEMBRA con icono |
| Estado | Badge activo/inactivo |
| Acciones | Ver, Editar, Eliminar |

### Modal de creación/edición

- Layout en grid 2 columnas (desktop), 1 columna (mobile).
- **Campos del formulario**:
  - Nombre (text)
  - Especie (select)
  - Raza (text)
  - Sexo (select)
  - Fecha de nacimiento (date) — con cálculo de edad visible
  - Peso en kg (number)
  - Color (text)
  - Esterilizado (checkbox)
  - Alergias (textarea)
  - Observaciones (textarea)
  - Dueño/Cliente (select con búsqueda)
  - Activo (checkbox)

### Selector de cliente

- Select con búsqueda integrada.
- Consume `GET /api/clientes?limite=50&estado=activos` para obtener la lista.
- Muestra: `Nombres Apellidos — DNI`.
- Se precarga al abrir el modal.

### Drawer de detalle

- Slide-in desde la derecha (patrón `DetalleCliente`).
- Muestra toda la información de la mascota.
- Sección con datos del dueño (nombre, DNI, celular).
- Cálculo de edad visible si hay `fechaNacimiento`.

### Emojis/iconos por especie

| Especie | Emoji |
|---------|-------|
| PERRO | 🐕 |
| GATO | 🐈 |
| AVE | 🦜 |
| CONEJO | 🐇 |
| HAMSTER | 🐹 |
| REPTIL | 🦎 |
| PEZ | 🐠 |
| OTRO | 🐾 |

### Skeleton loaders

6 filas skeleton al cargar (consistente con clientes).

### Empty state

Cuando no hay mascotas: título "Sin mascotas" + texto "Ajusta la búsqueda o registra la primera mascota."

### Toast notifications

- Creación exitosa: "Mascota creada."
- Actualización exitosa: "Mascota actualizada."
- Eliminación exitosa: "Mascota eliminada correctamente."
- Error genérico: "No pudimos [acción] la mascota."
- Duración: 3200ms (consistente con clientes).

---

## 11. Migración Prisma

### Nombre de migración sugerido

```
20260524030000_fase_06_mascotas
```

Sigue la convención de nombres existente:
- `20260524000000_fase_02_auth`
- `20260524010000_fase_03_landing_contacto`
- `20260524020000_fase_05_clientes`

### Comando

```bash
npx prisma migrate dev --name fase_06_mascotas --schema=./database/schema/schema.prisma
```

---

## 12. Archivos a Modificar (Resumen)

### Prisma

| Archivo | Acción |
|---------|--------|
| `database/schema/schema.prisma` | Agregar modelo Mascota + relación en Usuario |

### Backend (NestJS)

| Archivo | Acción |
|---------|--------|
| `backend/src/mascotas/mascotas.controller.ts` | Reemplazar stub con CRUD completo |
| `backend/src/mascotas/mascotas.service.ts` | Reemplazar stub con lógica de negocio |
| `backend/src/mascotas/mascotas.module.ts` | Mantener (ya importa correctamente) |
| `backend/src/mascotas/dto/crear-mascota.dto.ts` | Nuevo |
| `backend/src/mascotas/dto/actualizar-mascota.dto.ts` | Nuevo |
| `backend/src/mascotas/dto/listar-mascotas.dto.ts` | Nuevo |

### Frontend (Next.js)

| Archivo | Acción |
|---------|--------|
| `frontend/src/services/mascotas.ts` | Nuevo |
| `frontend/src/modules/mascotas/components/MascotasPage.tsx` | Nuevo |
| `frontend/src/app/dashboard/mascotas/page.tsx` | Modificar (reemplazar placeholder) |

### Documentación

| Archivo | Acción |
|---------|--------|
| `docs/endpoints.md` | Actualizar sección Mascotas |
| `memory/progreso_actual.md` | Actualizar con Fase 06 completada |

---

## 13. Lo que NO se modifica

- ❌ Módulo de autenticación.
- ❌ Módulo de clientes.
- ❌ Guards existentes (se reutilizan `JwtAuthGuard` + `RolesGuard`).
- ❌ Decorators existentes (se reutiliza `@Roles`).
- ❌ Componentes UI existentes (se reutilizan `Button`, `Input`, `Skeleton`).
- ❌ API interceptor y manejo de tokens.
- ❌ Layout del dashboard y sidebar.
- ❌ Fases futuras (citas, consultas, vacunas, reportes, etc.).
- ❌ Dependencias del proyecto.

---

## 14. Orden de Implementación Sugerido

1. **Prisma**: Agregar modelo `Mascota` y relación → migrar.
2. **Backend DTOs**: Crear los 3 DTOs.
3. **Backend Service**: Implementar lógica CRUD.
4. **Backend Controller**: Implementar endpoints.
5. **Frontend Service**: Crear `services/mascotas.ts`.
6. **Frontend Component**: Crear `MascotasPage.tsx`.
7. **Frontend Route**: Actualizar `page.tsx` del dashboard.
8. **Verificación**: Probar CRUD completo.
9. **Documentación**: Actualizar endpoints y progreso.
