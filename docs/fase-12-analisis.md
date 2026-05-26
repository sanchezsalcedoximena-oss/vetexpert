# Fase 12 - Analisis Tecnico: Dashboard Dinamico Administrativo

Este documento define la arquitectura recomendada para implementar Fase 12 de VetExpert segun el estado real posterior a Fase 10 y Fase 11.

VetExpert permanece como sistema administrativo/staff-only.

No existe:

- `Rol.CLIENTE`.
- `TipoUsuario`.
- Portal cliente funcional.
- Login cliente.
- Auth cliente.
- Cliente autenticable.

`Usuario` representa personal interno autenticable. `Cliente` representa un registro administrativo no autenticable.

---

## 1. Objetivo real de Fase 12

Fase 12 debe transformar el dashboard base en un tablero dinamico administrativo usando datos reales ya existentes del sistema.

Objetivos principales:

- Mostrar indicadores operativos utiles para el trabajo diario.
- Resumir citas, clientes administrativos, mascotas, historias clinicas y staff.
- Diferenciar la experiencia por rol: `ADMIN`, `VETERINARIO`, `SECRETARIA`.
- Mantener intactos los CRUD actuales.
- Mantener la arquitectura staff-only.
- Evitar redisenos profundos del dashboard shell ya estabilizado.
- Preparar una base de datos agregados para Fase 13 reportes.

Fase 12 no debe convertirse en un modulo de reportes historicos avanzado. Su foco debe ser visibilidad operativa inmediata.

---

## 2. Metricas reales posibles usando datos existentes

Metricas disponibles por contratos actuales:

- Citas por estado:
  - `PENDIENTE`
  - `CONFIRMADA`
  - `COMPLETADA`
  - `CANCELADA`
- Citas del dia.
- Proximas citas.
- Citas por rango de fechas.
- Citas por veterinario.
- Clientes administrativos activos.
- Mascotas activas.
- Mascotas por especie.
- Historias clinicas abiertas.
- Historias clinicas cerradas.
- Historias clinicas recientes.
- Staff activo por rol.
- Veterinarios activos.
- Secretarias activas.
- Administradores activos.

Metricas recomendadas para primera version:

- Total de citas de hoy.
- Proximas citas confirmadas o pendientes.
- Citas pendientes.
- Citas completadas en el periodo.
- Clientes activos.
- Mascotas activas.
- Historias clinicas abiertas.
- Staff activo por rol para `ADMIN`.

Metricas que conviene dejar para Fase 13:

- Tendencias mensuales complejas.
- Comparativas historicas extensas.
- Exportaciones.
- Ranking de veterinarios.
- Reportes financieros.
- Indicadores clinicos avanzados.

---

## 3. Widgets/cards recomendados

Widgets iniciales recomendados:

- Card "Citas de hoy".
- Card "Pendientes".
- Card "Completadas".
- Card "Historias abiertas".
- Card "Clientes activos".
- Card "Mascotas activas".
- Card "Veterinarios activos" solo para `ADMIN` o vista administrativa.
- Lista "Proximas citas".
- Lista "Historias clinicas recientes" o "Historias abiertas".
- Bloque "Distribucion de citas por estado".
- Bloque "Mascotas por especie".

Acciones rapidas recomendadas:

- Nueva cita.
- Nuevo cliente.
- Nueva mascota.
- Ver agenda.
- Ver historias abiertas.
- Gestionar staff, solo `ADMIN`.

Las acciones rapidas deben navegar a flujos existentes. No deben crear modales nuevos duplicados del CRUD.

---

## 4. Diferencia entre dashboard ADMIN vs VETERINARIO vs SECRETARIA

### ADMIN

Debe ver vision global:

- Citas del dia de toda la clinica.
- Citas por estado.
- Proximas citas globales.
- Clientes activos.
- Mascotas activas.
- Historias clinicas abiertas.
- Staff activo por rol.
- Alertas administrativas simples:
  - historias abiertas.
  - citas pendientes.
  - staff inactivo, si se decide mostrarlo.

Acciones:

- Ir a clientes.
- Ir a mascotas.
- Ir a citas.
- Ir a staff.

### SECRETARIA

Debe priorizar operacion y agenda:

- Citas de hoy.
- Proximas citas.
- Citas pendientes y confirmadas.
- Clientes activos.
- Mascotas activas.
- Accesos rapidos a crear cita, cliente y mascota.

No necesita:

- Staff activo por rol.
- Indicadores administrativos sensibles.
- Gestion directa de staff.

### VETERINARIO

Debe priorizar su trabajo clinico:

- Sus citas de hoy.
- Sus proximas citas.
- Citas pendientes/confirmadas asignadas.
- Citas completadas recientes.
- Historias clinicas abiertas asociadas a sus citas.
- Acceso rapido a citas e historias clinicas.

No debe ver:

- Gestion de staff.
- Indicadores globales administrativos que no correspondan a su rol.
- Datos que sugieran acceso administrativo total si backend no lo permite.

Importante:

- La vista de `VETERINARIO` debe respetar las reglas actuales de citas e historias clinicas.
- No debe romper el uso de veterinarios reales desde `GET /api/usuarios/veterinarios`.
- No debe modificar el selector controlado de veterinarios en citas.

---

## 5. Riesgos de performance

Riesgos si se reutilizan endpoints existentes sin cuidado:

- Multiples requests simultaneos al cargar `/dashboard`.
- Descarga de listados completos solo para obtener conteos.
- Paginaciones usadas como pseudo-agregados con limites altos.
- Consultas repetidas por cada card.
- Calculos de frontend sobre demasiados registros.
- Latencia acumulada en mobile.
- Inconsistencias temporales si cada widget consulta en momentos distintos.

Riesgos en backend si se crea endpoint agregado:

- Consultas agregadas pesadas sin indices adecuados.
- Un endpoint demasiado grande que mezcle demasiadas responsabilidades.
- Respuesta dificil de versionar si se agregan reportes futuros.
- Filtrado por rol incompleto.
- Exponer datos globales a roles que solo deben ver informacion acotada.

Mitigaciones:

- Definir rangos de fecha acotados por defecto.
- Evitar traer listados completos para contadores.
- Usar conteos y agregaciones en backend cuando la metrica lo requiera.
- Mantener payloads pequenos.
- Separar resumen operativo de reportes historicos.
- Aplicar reglas por rol en backend, no solo ocultar cards en frontend.

---

## 6. Estrategia backend recomendada

Existen dos caminos posibles.

### Opcion A: reutilizar endpoints existentes

Endpoints reutilizables:

- `GET /api/citas`
- `GET /api/clientes`
- `GET /api/mascotas`
- `GET /api/historias-clinicas`
- `GET /api/staff`
- `GET /api/usuarios/veterinarios`

Pros:

- No agrega contrato backend nuevo.
- Menor esfuerzo inicial.
- Reduce riesgo de tocar backend.
- Permite prototipo rapido del dashboard.
- Aprovecha filtros ya existentes.

Contras:

- Puede requerir muchas llamadas.
- Algunos conteos podrian depender de `meta.total`, no de agregados reales.
- Puede forzar requests redundantes.
- Para graficos por estado o especie se necesitarian varias llamadas o procesamiento frontend.
- Menos eficiente con bases de datos grandes.

Uso recomendado:

- Solo para primera exploracion visual o widgets simples.
- Ideal si se quiere validar UX antes de agregar endpoint dedicado.
- No ideal como cierre definitivo si se incluyen varias metricas y graficos.

### Opcion B: endpoint agregado de dashboard

Endpoint recomendado:

```text
GET /api/dashboard/resumen
```

Posibles query params:

- `fechaInicio`
- `fechaFin`
- `zonaHoraria`

Respuesta conceptual:

```json
{
  "periodo": {
    "fechaInicio": "2026-05-01",
    "fechaFin": "2026-05-31"
  },
  "metricas": {
    "citasHoy": 8,
    "citasPendientes": 4,
    "citasConfirmadas": 6,
    "citasCompletadas": 15,
    "clientesActivos": 120,
    "mascotasActivas": 180,
    "historiasAbiertas": 9
  },
  "citasPorEstado": [
    { "estado": "PENDIENTE", "total": 4 },
    { "estado": "CONFIRMADA", "total": 6 },
    { "estado": "COMPLETADA", "total": 15 },
    { "estado": "CANCELADA", "total": 2 }
  ],
  "mascotasPorEspecie": [
    { "especie": "CANINO", "total": 80 },
    { "especie": "FELINO", "total": 45 }
  ],
  "proximasCitas": [],
  "staffPorRol": [
    { "rol": "ADMIN", "total": 1 },
    { "rol": "VETERINARIO", "total": 4 },
    { "rol": "SECRETARIA", "total": 2 }
  ]
}
```

Pros:

- Una sola llamada principal para el dashboard.
- Mejor rendimiento.
- Permite aplicar reglas por rol en backend.
- Evita descargar listados completos.
- Centraliza agregaciones.
- Facilita evolucion hacia reportes.

Contras:

- Requiere implementar backend nuevo.
- Debe definirse contrato con cuidado.
- Aumenta superficie de permisos.
- Puede crecer demasiado si se mezclan metricas operativas y reportes.

Recomendacion:

- Para Fase 12 conviene implementar un endpoint agregado acotado: `GET /api/dashboard/resumen`.
- El endpoint debe ser operativo, no de reportes.
- Debe devolver solo lo necesario para el primer dashboard dinamico.
- Debe aplicar visibilidad por rol desde backend.
- Los endpoints existentes pueden seguir usandose para listas completas y navegacion.

---

## 7. Estrategia frontend recomendada

Frontend recomendado:

- Mantener ruta actual `/dashboard`.
- Reemplazar cards estaticas por cards dinamicas.
- Crear service tipado `frontend/src/services/dashboard.ts` cuando se implemente.
- Crear tipos especificos para respuesta del resumen.
- Crear componentes pequenos:
  - `DashboardMetricCard`.
  - `DashboardQuickActions`.
  - `UpcomingAppointments`.
  - `DashboardChartCard`.
  - `DashboardSectionSkeleton`.
- Usar los patrones ya estabilizados de Fase 11:
  - skeletons.
  - empty states.
  - loading states.
  - dark mode.
  - responsive.

Reglas:

- No duplicar formularios de CRUD dentro del dashboard.
- Las acciones deben navegar a rutas existentes.
- No mezclar datos de `Cliente` con `Usuario`.
- No crear experiencia de cliente autenticado.
- No tocar el selector de veterinarios en citas.
- No introducir librerias nuevas sin decision explicita.

Manejo por rol:

- Leer usuario autenticado desde store/sesion existente.
- Mostrar widgets segun rol.
- Asumir que backend tambien filtra los datos.
- No depender solo de ocultamiento visual.

---

## 8. Responsive y loading states

Responsive recomendado:

- Mobile:
  - Cards en una columna.
  - Listas compactas.
  - Acciones rapidas en grid de 2 columnas o lista.
  - Graficos simples o barras horizontales.
  - Evitar tablas dentro del dashboard inicial.
- Tablet:
  - Cards en 2 columnas.
  - Listas y graficos apilados o en 2 columnas.
- Desktop:
  - Cards en 4 columnas segun espacio.
  - Layout de secciones con grid.
  - Listas de proximas citas y graficos en columnas.

Loading states:

- Skeleton de cards metricas.
- Skeleton de lista para proximas citas.
- Skeleton de grafico como bloque estructural.
- Mantener datos previos si se refresca el dashboard.
- Empty state cuando no haya citas proximas o historias abiertas.
- Error state con accion de reintentar.

No recomendado:

- Spinner global para cada card.
- Bloquear toda la pantalla si solo falla un widget secundario.
- Mostrar valores en cero cuando en realidad hubo error de carga.

---

## 9. Posibles graficos

Graficos utiles para Fase 12:

- Donut o barras para citas por estado.
- Barras para mascotas por especie.
- Linea simple de citas por dia en el periodo.
- Barras por rol de staff, solo `ADMIN`.

Sin instalar paquetes:

- Se pueden implementar graficos simples con HTML/CSS y Tailwind.
- Barras horizontales son suficientes para primera version.
- Evitar graficos complejos si requieren dependencias nuevas.

Con libreria futura:

- Si se decide agregar libreria, evaluar en una fase separada o al inicio de implementacion con aprobacion explicita.
- No instalar paquetes durante el analisis.

Recomendacion inicial:

- Usar cards y barras simples con CSS.
- Dejar graficos avanzados para Fase 13 reportes.

---

## 10. Que NO debe tocar Fase 12

No debe tocar:

- Arquitectura staff-only.
- `Rol.CLIENTE`.
- `TipoUsuario`.
- Auth cliente.
- Portal cliente.
- Prisma schema salvo decision posterior explicitamente justificada.
- Migraciones.
- CRUD de clientes.
- CRUD de mascotas.
- CRUD de citas.
- CRUD de historias clinicas.
- CRUD de staff.
- Hardening de ultimo `ADMIN`.
- `GET /api/usuarios/veterinarios`.
- Selector controlado de veterinarios en citas.
- Contrato actual de citas.
- Contrato actual de historias clinicas.
- Registro publico.
- Contacto publico via WhatsApp.
- Reset password staff.
- Auditoria.
- Reportes avanzados.
- Exportaciones.
- Permisos granulares nuevos.

---

## 11. Riesgos a evitar

Riesgos funcionales:

- Exponer datos globales a `VETERINARIO` cuando solo debe ver su informacion operativa.
- Confundir `Cliente` administrativo con `Usuario`.
- Reintroducir conceptos de cliente autenticable.
- Romper compatibilidad con citas.
- Cambiar filtros o contratos existentes para acomodar el dashboard.
- Crear dependencias del dashboard sobre datos no garantizados.

Riesgos tecnicos:

- Hacer N requests por cada card.
- Traer listados completos para calcular metricas.
- Crear un endpoint agregado demasiado amplio.
- Mezclar dashboard operativo con reportes historicos.
- Implementar graficos complejos antes de tener metricas estables.
- Instalar dependencias innecesarias.
- Cambiar Prisma sin necesidad.

Riesgos UX:

- Saturar el dashboard con demasiada informacion.
- Mostrar indicadores irrelevantes para cada rol.
- Usar graficos que no aporten decision operativa.
- No distinguir loading de valor cero.
- No tener empty states claros.

---

## 12. Plan por subfases implementables

### Fase 12.1 - Contrato y alcance del dashboard

- Definir widgets exactos para primera version.
- Definir rango temporal por defecto.
- Definir visibilidad por rol.
- Decidir si se implementa endpoint agregado desde el inicio.

### Fase 12.2 - Backend dashboard resumen

- Crear modulo o controller de dashboard.
- Implementar `GET /api/dashboard/resumen`.
- Agregar DTOs de query y respuesta.
- Aplicar guards JWT y roles.
- Filtrar resultados segun rol.
- Agregar conteos y agregaciones acotadas.
- No tocar Prisma schema.

### Fase 12.3 - Service frontend y tipos

- Crear service `dashboard.ts`.
- Tipar respuesta del resumen.
- Integrar manejo de errores.
- Reutilizar interceptor Axios existente.

### Fase 12.4 - UI de cards dinamicas

- Reemplazar contenido estatico del dashboard por metricas reales.
- Agregar skeletons.
- Agregar empty/error states.
- Mantener responsive y dark mode.

### Fase 12.5 - Listas operativas

- Agregar proximas citas.
- Agregar historias abiertas o recientes segun rol.
- Navegar a modulos existentes para detalle.
- No duplicar CRUD.

### Fase 12.6 - Graficos simples

- Implementar barras simples para citas por estado.
- Implementar barras simples para mascotas por especie.
- Mantener accesibilidad textual de los datos.

### Fase 12.7 - Verificacion y documentacion

- Ejecutar typecheck backend si se toca backend.
- Ejecutar typecheck frontend.
- Verificar dashboard por rol.
- Verificar que citas y selector de veterinarios siguen intactos.
- Documentar implementacion real en `docs/fase-12-implementacion.md`.
- Actualizar memoria y contexto global.

---

## 13. Preparacion para futura Fase 13 reportes

Fase 12 debe dejar bases, no reemplazar reportes.

Preparacion ideal:

- Separar `dashboard/resumen` de futuros endpoints de reportes.
- Mantener metricas de dashboard acotadas a operacion diaria.
- Definir contratos claros de agregaciones.
- Evitar sobrecargar el endpoint con filtros complejos.
- Registrar necesidades futuras detectadas:
  - reportes por rango amplio.
  - exportacion CSV/PDF.
  - tendencias mensuales.
  - productividad por veterinario.
  - citas canceladas por periodo.
  - historias cerradas por periodo.

Fase 13 deberia analizar reportes como modulo independiente, con permisos, filtros, exportaciones y performance propia.

---

## 14. Criterios reales de cierre

Fase 12 puede cerrarse cuando:

- Dashboard `/dashboard` muestre datos reales.
- Las metricas principales carguen desde backend o estrategia aprobada.
- La vista cambie correctamente segun rol.
- `ADMIN` tenga vision global.
- `SECRETARIA` tenga foco operativo de agenda/clientes/mascotas.
- `VETERINARIO` tenga foco en sus citas e historias.
- Loading, empty states y error states sean claros.
- Responsive y dark mode se mantengan correctos.
- No se haya reintroducido auth cliente.
- No exista `Rol.CLIENTE` ni `TipoUsuario`.
- No se haya roto `GET /api/usuarios/veterinarios`.
- No se haya roto el selector controlado de veterinarios en citas.
- No se hayan alterado CRUDs estables fuera del alcance.
- Typecheck backend pase si se implementa endpoint agregado.
- Typecheck frontend pase.
- Se documente el cierre real en `docs/fase-12-implementacion.md`.

---

## 15. Recomendacion final

La arquitectura mas conveniente para Fase 12 es un dashboard operativo con endpoint agregado acotado:

```text
GET /api/dashboard/resumen
```

Este endpoint debe convivir con los endpoints actuales, no reemplazarlos.

La implementacion deberia avanzar primero por contrato y backend agregado minimo, luego service frontend tipado, despues cards dinamicas, listas operativas y finalmente graficos simples. Este orden reduce riesgo, evita llamadas redundantes y mantiene los CRUD actuales como fuente operativa estable.
