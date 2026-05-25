# Fase 08 - Analisis Tecnico: Historia Clinica

Este documento formaliza el diseno tecnico de la Fase 08 de VetExpert. La Historia Clinica se integra con el flujo existente de Citas y Mascotas, manteniendo la arquitectura modular del proyecto, Prisma ORM, NestJS backend, Next.js frontend, guards JWT, roles existentes, soft delete y tipado estricto TypeScript.

---

## 1. Objetivo de la fase

La Fase 08 incorpora el historial medico de una mascota a partir de atenciones veterinarias reales.

La Historia Clinica no nace como un modulo aislado ni como un registro manual independiente. Debe generarse exclusivamente desde una `Cita` con estado `COMPLETADA`, porque esa cita representa una atencion ya realizada por un veterinario.

El objetivo funcional es permitir que cada mascota tenga un historial cronologico de atenciones medicas, trazable desde sus citas completadas y vinculado al veterinario que realizo la atencion.

Relaciones funcionales base:

* Una `Mascota` puede tener multiples `Citas`.
* Una `Cita` completada puede generar una unica `HistoriaClinica`.
* Una `Mascota` puede tener multiples `HistoriasClinicas` a lo largo del tiempo.

Relaciones correctas:

```text
Mascota 1:N Citas
Cita 1:1 HistoriaClinica
Mascota 1:N HistoriasClinicas
```

---

## 2. Decisiones arquitectonicas

### 2.1 Relacion 1:1 entre Cita e HistoriaClinica

Se define una relacion 1:1 entre `Cita` e `HistoriaClinica`.

Justificacion:

* Una cita completada representa una atencion veterinaria puntual.
* Esa atencion debe producir como maximo un registro clinico principal.
* Evita duplicidad de historias para una misma consulta.
* Permite trazabilidad directa entre agenda, atencion y registro medico.
* Facilita validar que la historia solo se cree si la cita esta `COMPLETADA`.

La restriccion se implementara con `citaId` unico en `HistoriaClinica`.

### 2.2 Relacion 1:N entre Mascota e HistoriasClinicas

Se define una relacion 1:N entre `Mascota` e `HistoriaClinica`.

Justificacion:

* Una mascota puede atenderse muchas veces durante su vida.
* Cada cita completada puede generar una historia clinica.
* La vista principal del historial medico debe ser cronologica por mascota.
* Permite consultar el historial completo sin depender solo de la agenda.

### 2.3 Derivacion automatica de mascotaId y veterinarioId desde la cita

`mascotaId` y `veterinarioId` no deben recibirse desde el payload de creacion.

Se derivan automaticamente desde la `Cita` origen:

* `mascotaId` proviene de `cita.mascotaId`.
* `veterinarioId` proviene de `cita.veterinarioId`.

Justificacion:

* Evita registros clinicos cruzados entre mascotas.
* Evita asignar historias a veterinarios que no atendieron la cita.
* Mantiene consistencia con la Fase 07, donde `clienteId` se deriva desde la mascota.
* Reduce errores y manipulacion indebida desde el frontend.

### 2.4 Uso de soft delete

`HistoriaClinica` debe implementar soft delete mediante `eliminadoEn`.

Justificacion:

* El historial medico tiene valor clinico, operativo y potencialmente legal.
* No debe eliminarse fisicamente en operaciones normales.
* Permite ocultar registros anulados sin perder trazabilidad interna.

### 2.5 Bloqueo de edicion cuando la historia este cerrada

La entidad incluye el campo `cerrada`.

Cuando `cerrada = true`:

* No se permite modificar `diagnostico`.
* No se permite modificar `tratamiento`.
* No se permite modificar `observaciones`.
* No se permite eliminar por roles operativos.

Justificacion:

* Una historia cerrada representa un registro clinico finalizado.
* Evita alteraciones posteriores no controladas.
* Mantiene integridad del historial medico.

### 2.6 Reapertura solo por ADMIN

La reapertura de una historia cerrada debe estar permitida unicamente para `ADMIN`.

Justificacion:

* La reapertura es una accion excepcional.
* Debe reservarse a un rol administrativo superior.
* Permite corregir errores controladamente sin dejar el registro permanentemente bloqueado.

### 2.7 Trazabilidad cronologica del historial medico

La historia clinica debe ordenarse principalmente por `fecha`.

La vista de mascota debe mostrar el historial como timeline clinico cronologico, agrupado por fecha y vinculado a:

* cita origen
* mascota atendida
* veterinario responsable
* diagnostico
* tratamiento
* estado abierta/cerrada

---

## 3. Diseno Prisma

### 3.1 Nuevo modelo: HistoriaClinica

```prisma
model HistoriaClinica {
  id            String    @id @default(uuid()) @db.Uuid
  fecha         DateTime  @default(now()) @map("fecha")
  diagnostico   String    @map("diagnostico")
  tratamiento   String    @map("tratamiento")
  observaciones String?   @map("observaciones")
  cerrada       Boolean   @default(false) @map("cerrada")
  citaId        String    @unique @map("cita_id") @db.Uuid
  mascotaId     String    @map("mascota_id") @db.Uuid
  veterinarioId String    @map("veterinario_id") @db.Uuid
  creadoEn      DateTime  @default(now()) @map("creado_en")
  actualizadoEn DateTime  @updatedAt @map("actualizado_en")
  eliminadoEn   DateTime? @map("eliminado_en")

  cita          Cita      @relation(fields: [citaId], references: [id], onDelete: Restrict)
  mascota       Mascota   @relation(fields: [mascotaId], references: [id], onDelete: Restrict)
  veterinario   Usuario   @relation(fields: [veterinarioId], references: [id], onDelete: Restrict)

  @@index([mascotaId])
  @@index([veterinarioId])
  @@index([fecha])
  @@index([cerrada])
  @@map("historias_clinicas")
}
```

### 3.2 Relaciones inversas

En `Cita`:

```prisma
model Cita {
  // ... campos existentes ...
  historiaClinica HistoriaClinica?
}
```

En `Mascota`:

```prisma
model Mascota {
  // ... campos existentes ...
  historiasClinicas HistoriaClinica[]
}
```

En `Usuario`:

```prisma
model Usuario {
  // ... campos existentes ...
  historiasClinicas HistoriaClinica[]
}
```

### 3.3 Indices y restricciones

* `citaId` debe ser `@unique` para garantizar una sola historia por cita.
* `mascotaId` debe indexarse para consultas por perfil de mascota.
* `veterinarioId` debe indexarse para auditoria y filtrado por profesional.
* `fecha` debe indexarse para timeline cronologico.
* `cerrada` puede indexarse para filtros administrativos.
* `eliminadoEn` se usara en queries para soft delete, siguiendo el patron de clientes, mascotas y citas.

---

## 4. Reglas de negocio

### 4.1 Creacion desde cita completada

Solo se permite crear una `HistoriaClinica` desde una `Cita` existente con:

* `estado: COMPLETADA`
* `eliminadoEn: null`

Si la cita esta `PENDIENTE`, `CONFIRMADA` o `CANCELADA`, la creacion debe rechazarse.

### 4.2 Una unica historia por cita

Antes de crear una historia clinica se debe validar que no exista otra historia activa asociada al mismo `citaId`.

Si ya existe una historia clinica para esa cita, la operacion debe fallar con error de conflicto.

### 4.3 Derivacion automatica desde cita

En creacion:

* `citaId` viene desde el parametro de ruta.
* `mascotaId` se toma desde la cita.
* `veterinarioId` se toma desde la cita.

El payload no debe aceptar `mascotaId` ni `veterinarioId`.

### 4.4 Proteccion contra historias huerfanas

No se permite crear historias clinicas sin cita.

Ademas:

* La cita debe existir.
* La cita no debe estar eliminada.
* La mascota relacionada debe existir y no estar eliminada.
* El veterinario relacionado debe existir, estar activo y no estar eliminado.

### 4.5 Edicion

Se permite editar una historia clinica solo si:

* `cerrada = false`
* `eliminadoEn = null`
* el rol tiene permiso de edicion

Campos editables:

* `diagnostico`
* `tratamiento`
* `observaciones`

Campos no editables por DTO:

* `citaId`
* `mascotaId`
* `veterinarioId`
* `fecha`
* `creadoEn`
* `actualizadoEn`
* `eliminadoEn`

### 4.6 Cierre

El cierre marca `cerrada = true`.

Una historia cerrada queda bloqueada para edicion ordinaria.

El cierre puede ejecutarlo:

* `ADMIN`
* `VETERINARIO` responsable de la cita

### 4.7 Reapertura

La reapertura marca `cerrada = false`.

Solo puede ejecutarla:

* `ADMIN`

La reapertura debe considerarse una accion excepcional.

### 4.8 Soft delete

La eliminacion logica establece:

```ts
eliminadoEn: new Date()
```

Permiso recomendado:

* Solo `ADMIN`

No debe eliminar fisicamente la fila.

---

## 5. Roles y permisos

### ADMIN

Puede:

* Listar todas las historias clinicas.
* Ver detalle de cualquier historia.
* Crear historia desde una cita completada.
* Editar historias abiertas.
* Cerrar historias abiertas.
* Reabrir historias cerradas.
* Ejecutar soft delete.

### VETERINARIO

Puede:

* Listar historias asociadas a sus atenciones.
* Ver historias de sus citas atendidas.
* Crear historia desde una cita completada asignada a su usuario.
* Editar historias abiertas de sus propias citas.
* Cerrar historias abiertas de sus propias citas.

No puede:

* Reabrir historias cerradas.
* Eliminar historias clinicas.
* Editar historias cerradas.
* Crear historia para citas asignadas a otro veterinario.

### SECRETARIA

Puede:

* Listar historias clinicas.
* Ver detalle.
* Consultar historial por mascota.

No puede:

* Crear historia clinica.
* Editar diagnostico, tratamiento u observaciones.
* Cerrar historias.
* Reabrir historias.
* Eliminar historias.

---

## 6. Endpoints REST

Base path:

```text
/api/historias-clinicas
```

### GET /api/historias-clinicas

Lista historias clinicas con filtros y paginacion.

Roles:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

Filtros:

* `pagina`
* `limite`
* `busqueda`
* `mascotaId`
* `veterinarioId`
* `citaId`
* `fechaInicio`
* `fechaFin`
* `cerrada`

Reglas:

* Excluir registros con `eliminadoEn != null`.
* `VETERINARIO` debe ver por defecto solo sus historias.
* `ADMIN` y `SECRETARIA` pueden consultar todo.

Response esperado:

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
      "mascota": {
        "id": "uuid-mascota",
        "nombre": "Lucas",
        "especie": "PERRO"
      },
      "veterinario": {
        "id": "uuid-veterinario",
        "nombres": "Ana",
        "apellidos": "Torres"
      },
      "cita": {
        "id": "uuid-cita",
        "fecha": "2026-05-25T15:00:00.000Z",
        "motivo": "Consulta dermatologica"
      },
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

### GET /api/historias-clinicas/:id

Obtiene el detalle de una historia clinica.

Roles:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

Reglas:

* Debe existir y no estar eliminada.
* `VETERINARIO` solo puede acceder si la historia pertenece a una cita asignada a su usuario.

Response esperado:

```json
{
  "id": "uuid-historia",
  "fecha": "2026-05-25T15:30:00.000Z",
  "diagnostico": "Dermatitis leve",
  "tratamiento": "Tratamiento topico por 7 dias",
  "observaciones": "Control en una semana",
  "cerrada": false,
  "citaId": "uuid-cita",
  "mascotaId": "uuid-mascota",
  "veterinarioId": "uuid-veterinario"
}
```

### GET /api/historias-clinicas/mascota/:mascotaId

Lista el historial clinico cronologico de una mascota.

Roles:

* `ADMIN`
* `SECRETARIA`
* `VETERINARIO`

Reglas:

* La mascota debe existir y no estar eliminada.
* Debe excluir historias eliminadas.
* Orden recomendado: `fecha desc`.

Response esperado:

```json
{
  "datos": [
    {
      "id": "uuid-historia",
      "fecha": "2026-05-25T15:30:00.000Z",
      "diagnostico": "Dermatitis leve",
      "tratamiento": "Tratamiento topico por 7 dias",
      "cerrada": true,
      "veterinario": {
        "id": "uuid-veterinario",
        "nombres": "Ana",
        "apellidos": "Torres"
      }
    }
  ]
}
```

### POST /api/historias-clinicas/cita/:citaId

Crea una historia clinica desde una cita completada.

Roles:

* `ADMIN`
* `VETERINARIO`

Reglas:

* La cita debe existir.
* La cita debe tener `estado: COMPLETADA`.
* La cita no debe estar eliminada.
* No debe existir historia clinica previa para esa cita.
* `mascotaId` y `veterinarioId` se derivan desde la cita.
* `VETERINARIO` solo puede crear si la cita esta asignada a su usuario.

Request esperado:

```json
{
  "diagnostico": "Dermatitis leve",
  "tratamiento": "Tratamiento topico por 7 dias",
  "observaciones": "Control en una semana",
  "cerrada": false
}
```

Response esperado:

```json
{
  "id": "uuid-historia",
  "fecha": "2026-05-25T15:30:00.000Z",
  "diagnostico": "Dermatitis leve",
  "tratamiento": "Tratamiento topico por 7 dias",
  "observaciones": "Control en una semana",
  "cerrada": false,
  "citaId": "uuid-cita",
  "mascotaId": "uuid-mascota",
  "veterinarioId": "uuid-veterinario"
}
```

### PATCH /api/historias-clinicas/:id

Actualiza una historia clinica abierta.

Roles:

* `ADMIN`
* `VETERINARIO`

Reglas:

* La historia debe existir y no estar eliminada.
* La historia debe tener `cerrada: false`.
* `VETERINARIO` solo puede actualizar historias asociadas a sus citas.
* No permite modificar `citaId`, `mascotaId` ni `veterinarioId`.

Request esperado:

```json
{
  "diagnostico": "Dermatitis leve controlada",
  "tratamiento": "Extender tratamiento por 3 dias",
  "observaciones": "Buena evolucion"
}
```

### PATCH /api/historias-clinicas/:id/cerrar

Cierra una historia clinica.

Roles:

* `ADMIN`
* `VETERINARIO`

Reglas:

* La historia debe existir y no estar eliminada.
* Si ya esta cerrada, puede retornar la misma historia sin cambios o error controlado.
* `VETERINARIO` solo puede cerrar historias asociadas a sus citas.

Response esperado:

```json
{
  "id": "uuid-historia",
  "cerrada": true
}
```

### PATCH /api/historias-clinicas/:id/reabrir

Reabre una historia clinica cerrada.

Roles:

* `ADMIN`

Reglas:

* La historia debe existir y no estar eliminada.
* Solo `ADMIN` puede reabrir.
* Reabrir marca `cerrada: false`.

Response esperado:

```json
{
  "id": "uuid-historia",
  "cerrada": false
}
```

### DELETE /api/historias-clinicas/:id

Elimina logicamente una historia clinica.

Roles:

* `ADMIN`

Reglas:

* La historia debe existir y no estar eliminada.
* Debe asignar `eliminadoEn`.
* No debe borrar fisicamente el registro.

Response esperado:

```json
{
  "mensaje": "Historia clinica eliminada correctamente."
}
```

---

## 7. DTOs backend

Estructura propuesta:

```text
backend/src/historias-clinicas/dto/
  crear-historia-clinica.dto.ts
  actualizar-historia-clinica.dto.ts
  listar-historia-clinica.dto.ts
```

### 7.1 crear-historia-clinica.dto.ts

Campos:

* `diagnostico`
* `tratamiento`
* `observaciones`
* `cerrada`

Validaciones:

* `diagnostico`: requerido, string, minimo 3 caracteres, maximo 2000.
* `tratamiento`: requerido, string, minimo 3 caracteres, maximo 2000.
* `observaciones`: opcional, string, maximo 3000.
* `cerrada`: opcional, boolean.

No debe incluir:

* `citaId`
* `mascotaId`
* `veterinarioId`

### 7.2 actualizar-historia-clinica.dto.ts

Campos opcionales:

* `diagnostico`
* `tratamiento`
* `observaciones`

Validaciones:

* Mismas restricciones de longitud que el DTO de creacion.
* No debe aceptar `cerrada`; el cierre usa endpoint dedicado.
* No debe aceptar campos relacionales.

### 7.3 listar-historia-clinica.dto.ts

Campos:

* `pagina?: number = 1`
* `limite?: number = 10`
* `busqueda?: string`
* `mascotaId?: string`
* `veterinarioId?: string`
* `citaId?: string`
* `fechaInicio?: string`
* `fechaFin?: string`
* `cerrada?: boolean`

Validaciones:

* `pagina`: entero, minimo 1.
* `limite`: entero, minimo 1, maximo 50.
* IDs: UUID v4.
* Fechas: ISO date string.
* `cerrada`: boolean transformado desde query string.

---

## 8. Frontend

### 8.1 Service

Archivo:

```text
frontend/src/services/historias-clinicas.ts
```

Tipos:

* `HistoriaClinica`
* `HistoriasClinicasMeta`
* `HistoriasClinicasQuery`
* `HistoriaClinicaPayload`

Funciones:

* `listarHistoriasClinicas(query)`
* `obtenerHistoriaClinica(id)`
* `listarHistoriasPorMascota(mascotaId)`
* `crearHistoriaDesdeCita(citaId, payload)`
* `actualizarHistoriaClinica(id, payload)`
* `cerrarHistoriaClinica(id)`
* `reabrirHistoriaClinica(id)`
* `eliminarHistoriaClinica(id)`

### 8.2 Componentes iniciales

Estructura propuesta:

```text
frontend/src/modules/historias-clinicas/components/
  HistoriaClinicaTimeline.tsx
  HistoriaClinicaModal.tsx
  HistoriaClinicaDetalleDrawer.tsx
```

### 8.3 Integracion con vistas existentes

La historia clinica debe integrarse en:

* Perfil o detalle de mascota.
* Detalle de cita completada.

No debe presentarse inicialmente como modulo independiente de navegacion principal.

---

## 9. UX/UI

### 9.1 Timeline clinico cronologico

La vista principal debe mostrar una linea de tiempo por mascota, ordenada por fecha descendente.

Cada item debe mostrar:

* Fecha de atencion.
* Motivo de la cita.
* Veterinario.
* Diagnostico resumido.
* Tratamiento resumido.
* Badge de estado `Abierta` o `Cerrada`.
* Acciones disponibles por rol.

### 9.2 Agrupacion por fechas

El timeline puede agruparse por:

* Dia.
* Mes.
* Ano, si el historial crece.

Para la primera implementacion se recomienda agrupar visualmente por fecha de atencion.

### 9.3 Badges abierta/cerrada

Estados visuales:

* `Abierta`: badge primario o advertencia suave.
* `Cerrada`: badge de exito o neutral.

### 9.4 Drawer de detalle

El drawer debe incluir:

* Datos de mascota.
* Datos del dueno.
* Fecha de atencion.
* Veterinario.
* Cita origen.
* Diagnostico.
* Tratamiento.
* Observaciones.
* Estado de cierre.

### 9.5 Integracion desde citas completadas

En citas con estado `COMPLETADA`:

* Si no existe historia clinica, mostrar accion para crearla.
* Si ya existe, mostrar accion para ver historia.

### 9.6 Integracion desde perfil mascota

En el detalle de mascota:

* Agregar tab o seccion clinica.
* Mostrar timeline completo.
* Permitir abrir detalle de cada historia.

---

## 10. Flujo funcional recomendado

1. Se crea una cita.
2. La cita es atendida por el veterinario asignado.
3. La cita cambia a `COMPLETADA`.
4. El veterinario crea una historia clinica desde la cita completada.
5. La historia clinica toma automaticamente `mascotaId` y `veterinarioId` desde la cita.
6. La historia aparece cronologicamente en el perfil de la mascota.
7. La historia puede editarse mientras esta abierta.
8. La historia puede cerrarse.
9. Una historia cerrada queda bloqueada para edicion ordinaria.
10. Solo `ADMIN` puede reabrir una historia cerrada.

---

## 11. Plan de implementacion futuro

### Fase 08.1 - Prisma + migracion

* Agregar modelo `HistoriaClinica`.
* Agregar relaciones inversas en `Cita`, `Mascota` y `Usuario`.
* Validar schema Prisma.
* Crear migracion `fase_08_historia_clinica`.
* Regenerar Prisma Client.
* Migracion generada: `20260525151556_fase_08_historia_clinica`.

### Fase 08.2 - Backend modulo

* Crear modulo `historias-clinicas`.
* Crear service.
* Implementar reglas de negocio.
* Mantener patrones de Prisma ya usados en clientes, mascotas y citas.
* Estado: implementado sin controller REST.

### Fase 08.3 - Endpoints

* Crear controller.
* Aplicar `JwtAuthGuard`, `RolesGuard` y `@Roles()`.
* Exponer endpoints definidos en este documento.
* Probar permisos por rol.
* Estado: implementado.

### Fase 08.4 - Frontend services

* Crear `frontend/src/services/historias-clinicas.ts`.
* Tipar payloads, queries, meta y responses.
* Consumir endpoints reales.
* Estado: implementado.

### Fase 08.5 - UI timeline

* Crear timeline clinico por mascota.
* Crear modal de creacion/edicion.
* Crear drawer de detalle.
* Implementar badges abierta/cerrada.
* Mantener dark mode y responsive mobile/desktop.
* Estado: implementado.
* Componentes creados:
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaTimeline.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaTimelineItem.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaModal.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaDetalleDrawer.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaEmptyState.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaSkeleton.tsx`
  * `frontend/src/modules/historias-clinicas/components/HistoriaClinicaBadge.tsx`
* Integracion realizada dentro del drawer de detalle de mascota.
* Permisos UI implementados:
  * `SECRETARIA`: solo lectura.
  * `VETERINARIO`: editar y cerrar historias abiertas visibles para su usuario.
  * `ADMIN`: editar, cerrar y reabrir.
* La creacion visual queda soportada por el modal cuando exista `citaId` de una cita completada; la exposicion de esa accion desde citas queda reservada para Fase 08.6.

### Fase 08.6 - Integracion citas

* Integrar accion desde cita `COMPLETADA`.
* Mostrar crear/ver historia segun existencia.
* Integrar timeline en perfil o detalle de mascota.

---

## 12. Criterios de cierre de Fase 08

La fase se considerara completada cuando:

* El modelo Prisma y la migracion existan.
* El backend valide que solo citas `COMPLETADA` generan historia clinica.
* Cada cita tenga como maximo una historia clinica.
* `mascotaId` y `veterinarioId` se deriven desde la cita.
* El cierre bloquee ediciones ordinarias.
* Solo `ADMIN` pueda reabrir historias cerradas.
* Existan endpoints protegidos por rol.
* El frontend muestre timeline clinico por mascota.
* Se pueda crear/ver historia desde una cita completada.
* Backend y frontend pasen typecheck.

---

## 13. Alcance de este documento

Este documento es solo analisis arquitectonico y planificacion tecnica.

No implementa codigo, no genera migraciones, no actualiza dependencias, no modifica modulos existentes y no avanza fases futuras.
