# Fase 11 - Analisis Tecnico: UX/UI y Limpieza Operativa

Este documento define el alcance recomendado para Fase 11 de VetExpert segun el estado real posterior a Fase 10.

VetExpert permanece como sistema administrativo/staff-only.

No existe:

- `Rol.CLIENTE`.
- `TipoUsuario`.
- Portal cliente.
- Login cliente.
- Cliente autenticable.

`Usuario` representa personal interno autenticable. `Cliente` representa un registro administrativo no autenticable.

---

## 1. Objetivo real de Fase 11

Fase 11 debe enfocarse en estabilizar y pulir la experiencia operativa existente sin cambiar la arquitectura funcional del sistema.

Objetivos principales:

- Corregir problemas UX/UI detectables en flujos ya implementados.
- Homogeneizar estados visuales, formularios, modales, drawers y tablas.
- Mejorar responsive mobile y consistencia de layouts.
- Reforzar validaciones frontend menores.
- Mejorar loading states, skeletons, empty states y mensajes de error.
- Limpiar deuda visual u operativa que afecte el uso diario.
- Preparar una base visual estable para Fase 12 dashboard dinamico.

Fase 11 no debe implementar nuevos modulos grandes ni rehacer flujos completos.

---

## 2. Problemas UX/UI actuales detectables

Segun el estado documentado, los modulos principales ya existen:

- Dashboard base.
- Clientes.
- Mascotas.
- Citas.
- Historias clinicas.
- Staff.
- Landing publica.
- Login staff.

Problemas probables a revisar en Fase 11:

- Diferencias de estilo entre tablas, cards mobile, filtros y paginacion por modulo.
- Formularios con mensajes de validacion no completamente homogeneos.
- Modales y drawers con posibles diferencias de espaciado, scroll, botones y estados de cierre.
- Estados vacios que pueden variar demasiado entre clientes, mascotas, citas, historias y staff.
- Loading states que pueden no ser consistentes en densidad visual o ubicacion.
- Errores backend mostrados con estilos o textos distintos segun modulo.
- Textos largos como correos, nombres, direcciones u observaciones que pueden requerir mejor wrapping en mobile.
- Confirmaciones de acciones destructivas o sensibles que pueden requerir mayor consistencia.
- Dashboard base todavia no es dinamico; en Fase 11 solo debe mantenerse estable y preparar su futura evolucion.
- Carpetas vacias legacy `frontend/src/app/portal` y `frontend/src/app/registro` existen pero no exponen rutas funcionales.

---

## 3. Limpiezas tecnicas menores recomendadas

Las limpiezas deben ser pequenas, seguras y asociadas a UX/UI.

Recomendado:

- Revisar imports muertos en componentes de dashboard y modulos administrativos.
- Unificar helpers visuales de estados, roles y badges si ya existe patron repetido.
- Revisar nombres de props y tipos frontend si generan ambiguedad entre `Cliente` y `Staff`.
- Confirmar que los services frontend no mezclen contratos de `Cliente` administrativo con `Usuario` staff.
- Revisar textos con acentos o caracteres mal codificados si aparecen en UI real.
- Revisar consistencia de mensajes de toast para exito, error y conflictos.
- Mantener las carpetas legacy vacias solo si no afectan rutas; eliminarlas requeriria una decision explicita de limpieza estructural.

No recomendado:

- Refactor grande de arquitectura frontend.
- Reescribir services completos.
- Cambiar contratos backend.
- Cambiar schema Prisma.
- Crear migraciones.

---

## 4. Mejoras visuales seguras

Mejoras permitidas si no alteran comportamiento funcional:

- Unificar altura, alineacion y densidad de filtros.
- Mejorar espaciado responsive en headers de pagina.
- Homogeneizar botones primarios, secundarios y destructivos.
- Alinear badges de rol y estado entre staff, citas e historias clinicas.
- Mejorar contraste y legibilidad en dark mode.
- Refinar tablas desktop para evitar overflow horizontal innecesario.
- Mejorar cards mobile para lectura rapida de datos clave.
- Ajustar drawers para detalle de cita, mascota e historia clinica con jerarquia visual consistente.
- Mejorar empty states con acciones claras cuando ya exista una accion natural.
- Mantener el diseno premium actual sin introducir un rediseno extremo.

---

## 5. Validaciones frontend faltantes

Validaciones menores recomendadas:

- DNI peruano: 8 digitos cuando se ingrese.
- Celular peruano: 9 digitos iniciando en 9 cuando se ingrese.
- Correos con formato valido.
- Campos requeridos con mensajes consistentes.
- Fechas de cita con prevencion visual de fecha pasada.
- Observaciones, diagnosticos o textos largos con limites visuales razonables si el backend ya impone limites.
- Confirmacion antes de acciones sensibles:
  - eliminar cliente.
  - eliminar mascota.
  - eliminar cita.
  - inactivar staff.
  - cerrar historia clinica.
  - reabrir historia clinica.

Estas validaciones frontend no reemplazan las validaciones backend existentes.

---

## 6. Loading, skeleton y empty states

Fase 11 debe revisar y homogeneizar:

- Skeleton de tabla desktop.
- Skeleton de cards mobile.
- Loading en botones durante submit.
- Loading en filtros con busqueda debounceada.
- Empty state cuando no hay registros.
- Empty state cuando los filtros no devuelven resultados.
- Estado de error al cargar listados.
- Estado de error al abrir detalle por id.

Patron recomendado:

- Listado cargando: skeleton estructural.
- Submit cargando: boton deshabilitado con texto de accion en progreso.
- Filtro sin resultados: mensaje claro y opcion de limpiar filtros.
- Error backend: toast con mensaje claro y conservar datos previos si existen.

---

## 7. Mejoras mobile responsive

Revisar especialmente:

- Sidebar mobile y cierre al navegar.
- Headers de pagina con acciones principales.
- Filtros apilados en pantallas pequenas.
- Paginacion con controles tactiles comodos.
- Cards mobile con informacion prioritaria arriba.
- Modales en mobile con scroll interno estable.
- Drawers o dialogos que no oculten botones de accion.
- Textos largos en cards y tablas.
- Formularios largos de citas, mascotas, historias y staff.

No se debe romper la version desktop al ajustar mobile.

---

## 8. Consistencia de modales, drawers y forms

Estandar recomendado:

- Titulo claro por accion: crear, editar, detalle o confirmacion.
- Boton principal consistente a la derecha o en posicion ya usada por el proyecto.
- Boton cancelar/cerrar consistente.
- Loading visible durante submit.
- Inputs deshabilitados durante submit si evita doble envio.
- Mensajes de validacion debajo del campo.
- Selects controlados donde el valor dependa de datos backend.
- Drawers solo para lectura/detalle o flujos ya establecidos.
- Modales para creacion, edicion y confirmaciones.

Especial cuidado:

- No revertir el selector controlado de veterinarios en citas.
- No cambiar el contrato de `GET /api/usuarios/veterinarios`.
- No mezclar campos de `Cliente` administrativo con campos de `Usuario` staff.

---

## 9. Riesgos a evitar

Fase 11 debe evitar:

- Reintroducir auth cliente.
- Crear `Rol.CLIENTE` o `TipoUsuario`.
- Convertir `Cliente` en usuario autenticable.
- Cambiar relaciones de citas, mascotas o historias clinicas.
- Romper `GET /api/usuarios/veterinarios`.
- Romper selector de veterinarios en citas.
- Cambiar hardening administrativo de staff.
- Implementar dashboard dinamico complejo.
- Implementar auditoria.
- Implementar reset password completo.
- Implementar permisos granulares.
- Crear migraciones Prisma.
- Instalar paquetes innecesarios.
- Ejecutar `npm audit`.
- Redisenar toda la app desde cero.

---

## 10. Implementaciones recomendadas

Lista concreta para Fase 11:

- Normalizar estados de carga en clientes, mascotas, citas, historias y staff.
- Unificar empty states y mensajes de filtros sin resultados.
- Revisar responsive de tablas y cards mobile.
- Pulir modales de crear/editar por modulo.
- Pulir drawers de detalle de mascota, cita e historia clinica.
- Homogeneizar toasts de exito y error.
- Mejorar mensajes de errores backend en frontend.
- Revisar validaciones frontend de DNI, celular y correo.
- Revisar wrapping de textos largos.
- Revisar dark mode en badges, inputs, modales y tablas.
- Revisar accesibilidad basica: labels, foco visible, botones con texto claro.
- Revisar consistencia de botones destructivos.
- Revisar login staff y recuperacion staff a nivel visual, sin completar reset password backend.
- Documentar hallazgos visuales corregidos al cierre.

---

## 11. Plan por subfases implementables

### Fase 11.1 - Auditoria UX/UI operativa

- Revisar pantallas principales en desktop y mobile.
- Identificar inconsistencias visuales reales.
- Priorizar correcciones de bajo riesgo.
- Confirmar que citas y staff sigan estables.

### Fase 11.2 - Normalizacion de estados visuales

- Homogeneizar loading states.
- Homogeneizar skeletons.
- Homogeneizar empty states.
- Homogeneizar errores y toasts.

### Fase 11.3 - Formularios, modales y drawers

- Revisar formularios de clientes, mascotas, citas, historias y staff.
- Mejorar validaciones frontend menores.
- Unificar comportamiento de submit, cancelacion y errores.
- Revisar scroll y layout mobile.

### Fase 11.4 - Responsive y dark mode

- Ajustar cards mobile, tablas desktop y filtros.
- Revisar contraste en dark mode.
- Corregir overflow de textos largos.
- Revisar navegacion mobile del dashboard.

### Fase 11.5 - Limpieza operativa y cierre

- Retirar imports muertos si existen.
- Revisar textos visibles.
- Ejecutar typecheck frontend.
- Ejecutar typecheck backend solo si se tocan tipos compartidos o contratos.
- Actualizar `memory/progreso_actual.md` y documentar cierre real de Fase 11.

---

## 12. Que NO debe tocar Fase 11

No debe tocar:

- Arquitectura staff-only.
- Prisma schema.
- Migraciones.
- Auth cliente inexistente.
- Roles globales.
- Contrato `Usuario` staff.
- Contrato `Cliente` administrativo.
- Logica backend de citas.
- Logica backend de historias clinicas.
- Logica backend de mascotas.
- `GET /api/usuarios/veterinarios`.
- Selector controlado de veterinarios.
- Hardening de staff.
- Dashboard dinamico de metricas.
- Reportes.
- Auditoria.
- Permisos granulares.
- Reset password completo.
- Uploads o avatars.
- Websocket.
- Microservicios.

---

## 13. Preparacion ideal para Fase 12

Fase 12 debe iniciar cuando Fase 11 deje una base visual consistente y estable.

Preparacion esperada:

- Dashboard shell estable en desktop y mobile.
- Estados de carga y error reutilizables o al menos consistentes.
- Modulos administrativos con patrones visuales alineados.
- Badges, cards, tablas y filtros con comportamiento coherente.
- Contratos actuales preservados.
- Sin deuda visual critica en citas, historias o staff.

Punto exacto de entrada para Fase 12:

- Crear analisis de dashboard dinamico basado en datos reales existentes:
  - cantidad de citas por estado.
  - proximas citas.
  - mascotas activas.
  - clientes administrativos activos.
  - historias clinicas abiertas/cerradas.
  - staff activo por rol.

Fase 12 deberia empezar con definicion de metricas, endpoints agregados o reutilizacion segura de endpoints actuales, sin alterar los flujos CRUD ya estabilizados por Fase 11.

---

## 14. Roadmap propuesto

Roadmap inmediato:

1. Ejecutar Fase 11.1 para inventariar problemas visuales reales.
2. Aplicar correcciones transversales de loading, empty states y toasts.
3. Refinar formularios y responsive de modulos existentes.
4. Cerrar Fase 11 con typecheck y documentacion de implementacion.
5. Iniciar Fase 12 con dashboard dinamico acotado a metricas operativas reales.

Dependencias:

- Fase 11.2 depende de hallazgos de Fase 11.1.
- Fase 11.3 debe respetar patrones definidos en Fase 11.2.
- Fase 11.4 puede avanzar en paralelo con Fase 11.3 si no toca los mismos componentes.
- Fase 11.5 depende de todas las correcciones previas.
- Fase 12 depende de una Fase 11 cerrada sin regresiones visuales ni funcionales.

---

## 15. Criterios de cierre de Fase 11

Fase 11 puede cerrarse cuando:

- No se haya modificado la arquitectura staff-only.
- Citas siga funcionando con veterinarios reales desde `GET /api/usuarios/veterinarios`.
- Historias clinicas siga resolviendo veterinario y dueno correctamente.
- Dashboard, clientes, mascotas, citas, historias y staff mantengan responsive correcto.
- Loading, skeleton, empty states y toasts sean consistentes.
- Formularios y modales tengan validaciones frontend claras.
- Dark mode no presente contrastes criticos.
- Typecheck frontend pase.
- Typecheck backend pase si se toca codigo backend o tipos compartidos.
- La documentacion operativa quede actualizada.
