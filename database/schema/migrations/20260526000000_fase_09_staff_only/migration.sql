-- Fase 09 - Staff-only auth and administrative Cliente model.

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "dni" TEXT,
    "celular" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "eliminado_en" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- Preserve current administrative clients with their legacy IDs so mascotas/citas keep their cliente_id values.
INSERT INTO "clientes" (
    "id",
    "nombres",
    "apellidos",
    "correo",
    "dni",
    "celular",
    "direccion",
    "activo",
    "creado_en",
    "actualizado_en",
    "eliminado_en"
)
SELECT
    "id",
    "nombres",
    "apellidos",
    "correo",
    "dni",
    "celular",
    "direccion",
    "activo",
    "creado_en",
    "actualizado_en",
    "eliminado_en"
FROM "usuarios"
WHERE "tipo_usuario" = 'CLIENTE';

-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_celular_key" ON "clientes"("celular");

-- Repoint relations from usuarios to clientes.
ALTER TABLE "mascotas" DROP CONSTRAINT "mascotas_cliente_id_fkey";
ALTER TABLE "citas" DROP CONSTRAINT "citas_cliente_id_fkey";

ALTER TABLE "mascotas" ADD CONSTRAINT "mascotas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove auth artifacts for legacy client users before making Usuario staff-only.
DELETE FROM "refresh_tokens"
WHERE "usuario_id" IN (
    SELECT "id" FROM "usuarios" WHERE "tipo_usuario" = 'CLIENTE'
);

DELETE FROM "recuperaciones_clave"
WHERE "usuario_id" IN (
    SELECT "id" FROM "usuarios" WHERE "tipo_usuario" = 'CLIENTE'
);

DELETE FROM "usuarios"
WHERE "tipo_usuario" = 'CLIENTE';

-- Drop legacy public contact persistence. Public contact opens WhatsApp and does not use Prisma.
DROP TABLE IF EXISTS "mensajes_contacto";

-- Remove TipoUsuario from staff-only Usuario.
ALTER TABLE "usuarios" DROP COLUMN "tipo_usuario";
DROP TYPE "TipoUsuario";

-- Remove CLIENTE from Rol enum.
ALTER TYPE "Rol" RENAME TO "Rol_old";
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SECRETARIA', 'VETERINARIO');
ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "Rol" USING "rol"::text::"Rol";
DROP TYPE "Rol_old";
