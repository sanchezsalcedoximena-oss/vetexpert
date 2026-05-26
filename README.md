# VetExpert

VetExpert es un sistema web administrativo para clinicas veterinarias. Centraliza la gestion interna de clientes administrativos, mascotas, citas, historias clinicas, staff y un dashboard operativo con metricas reales.

El sistema esta disenado como una plataforma staff-only: los clientes representan duenos de mascotas dentro del panel administrativo, pero no tienen cuenta, contrasena, sesion ni portal autenticable.

## Stack tecnologico

Frontend:

- Next.js App Router
- React
- TypeScript estricto
- TailwindCSS
- Framer Motion
- Zustand
- Axios
- Zod
- Lucide React

Backend:

- NestJS
- TypeScript estricto
- Prisma ORM
- PostgreSQL
- JWT y refresh tokens
- Passport JWT
- bcryptjs
- class-validator

Base de datos e infraestructura:

- PostgreSQL
- Prisma migrations
- Supabase PostgreSQL recomendado para despliegue
- Vercel recomendado para frontend
- Railway o Render recomendado para backend

## Arquitectura general

VetExpert usa un monolito modular con frontend y backend separados dentro de un workspace npm.

- `frontend`: aplicacion Next.js.
- `backend`: API NestJS modular.
- `database`: schema Prisma, migraciones y seeds.
- `docs`: documentacion tecnica del proyecto.
- `memory`: estado operativo interno del proyecto.

La API expone sus rutas bajo el prefijo `/api`. El frontend consume el backend mediante un cliente Axios con interceptor de autenticacion y refresh automatico.

## Modulos existentes

- Landing publica con contacto via WhatsApp.
- Autenticacion staff.
- Dashboard administrativo dinamico.
- Gestion de clientes administrativos.
- Gestion de mascotas.
- Gestion de citas.
- Historias clinicas integradas a citas y mascotas.
- Gestion de staff para administradores.
- Selector de veterinarios para citas.
- Seed de administrador inicial.

## Autenticacion y roles

VetExpert autentica exclusivamente personal interno.

Roles activos:

- `ADMIN`
- `SECRETARIA`
- `VETERINARIO`

Reglas principales:

- `Usuario` representa staff autenticable.
- `Cliente` representa un registro administrativo no autenticable.
- No existe `Rol.CLIENTE`.
- No existe `TipoUsuario`.
- No existe portal cliente funcional.
- No existen tokens JWT para clientes.

El backend protege rutas con JWT y guards por rol. El frontend persiste la sesion staff, maneja refresh token automatico y restringe la navegacion visible segun rol.

## Dashboard dinamico

El dashboard interno consume datos reales desde:

```text
GET /api/dashboard/resumen
```

Metricas disponibles:

- Citas de hoy.
- Citas pendientes.
- Citas confirmadas.
- Citas completadas.
- Clientes activos.
- Mascotas activas.
- Historias clinicas abiertas.
- Proximas citas.
- Citas por estado.
- Mascotas por especie.
- Staff activo por rol, solo para `ADMIN`.

La vista cambia segun rol:

- `ADMIN`: vision global y resumen de staff.
- `SECRETARIA`: foco operativo de agenda, clientes y mascotas.
- `VETERINARIO`: datos relacionados a sus citas e historias.

Los graficos actuales son barras simples con TailwindCSS, sin dependencias externas de charts.

## UX/UI

- Diseno responsive.
- Mobile first.
- Dark mode persistente.
- Sidebar administrativa responsive.
- Skeleton loaders.
- Empty states.
- Toast notifications.
- Botones con loading state.
- Formularios con validaciones frontend.
- Wrapping de textos largos.
- Tablas desktop y cards mobile en modulos administrativos.

## Setup local

Requisitos:

- Node.js 20 o superior.
- npm.
- PostgreSQL disponible localmente o en un proveedor externo.

Instalar dependencias:

```bash
npm install
```

Configurar variables de entorno:

```bash
cp .env.example .env
```

Configurar `DATABASE_URL`, secretos JWT y URL del frontend/backend segun tu entorno.

Generar Prisma Client:

```bash
npm run prisma:generate --workspace backend
```

Ejecutar migraciones:

```bash
npm run prisma:migrate --workspace backend
```

Crear administrador inicial:

```bash
npm run prisma:seed
```

Credenciales iniciales del seed:

```text
Correo: admin@vetexpert.com
Password: Admin123*
```

## Variables de entorno

Variables principales:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/vetexpert
JWT_ACCESS_SECRET=una_clave_segura
NEXT_PUBLIC_API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
PORT=4000
```

Variables opcionales o de despliegue:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

No subas archivos `.env` al repositorio.

## Scripts principales

Desde la raiz:

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
npm run typecheck
npm run prisma:seed
```

Backend:

```bash
npm run typecheck --workspace backend
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

Frontend:

```bash
npm run typecheck --workspace frontend
npm run dev --workspace frontend
```

## Estructura de carpetas

```text
vetexpert/
  backend/
    src/
      auth/
      citas/
      clientes/
      common/
      dashboard/
      historias-clinicas/
      mascotas/
      staff/
      usuarios/
  frontend/
    src/
      app/
      components/
      modules/
      services/
      store/
      validators/
  database/
    schema/
    seeds/
  docs/
  memory/
```

## Estado actual del proyecto

El proyecto cuenta con:

- Arquitectura staff-only consolidada.
- API NestJS protegida con JWT.
- Modelo Prisma alineado a `Usuario` staff y `Cliente` administrativo.
- CRUDs administrativos principales.
- Historias clinicas integradas.
- Dashboard dinamico con metricas reales.
- UI responsive con dark mode.
- TypeScript estricto en frontend y backend.

## Roadmap futuro resumido

- Reportes administrativos y operativos.
- Configuracion avanzada de la clinica.
- Auditoria de acciones sensibles.
- Recuperacion completa de contrasena staff.
- Permisos mas granulares por modulo.
- Preparacion final para despliegue productivo.

## Instrucciones de desarrollo

- Mantener TypeScript estricto.
- No introducir autenticacion de clientes.
- No mezclar `Cliente` administrativo con `Usuario` staff.
- No romper el endpoint `GET /api/usuarios/veterinarios`.
- No modificar contratos backend sin actualizar services y documentacion.
- Ejecutar typecheck frontend y backend antes de cerrar cambios.
- Evitar dependencias nuevas si una solucion simple con el stack actual es suficiente.
- Mantener responsive, dark mode y accesibilidad basica en nuevas pantallas.
