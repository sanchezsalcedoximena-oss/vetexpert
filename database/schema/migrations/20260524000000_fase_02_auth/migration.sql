CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SECRETARIA', 'VETERINARIO', 'CLIENTE');
CREATE TYPE "TipoUsuario" AS ENUM ('STAFF', 'CLIENTE');

CREATE TABLE "usuarios" (
  "id" UUID NOT NULL,
  "nombres" TEXT NOT NULL,
  "apellidos" TEXT NOT NULL,
  "correo" TEXT NOT NULL,
  "dni" TEXT,
  "celular" TEXT,
  "password_hash" TEXT NOT NULL,
  "rol" "Rol" NOT NULL,
  "tipo_usuario" "TipoUsuario" NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "ultimo_acceso_en" TIMESTAMP(3),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  "eliminado_en" TIMESTAMP(3),
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expiracion_en" TIMESTAMP(3) NOT NULL,
  "revocado_en" TIMESTAMP(3),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recuperaciones_clave" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expiracion_en" TIMESTAMP(3) NOT NULL,
  "usado_en" TIMESTAMP(3),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recuperaciones_clave_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");
CREATE UNIQUE INDEX "usuarios_dni_key" ON "usuarios"("dni");
CREATE UNIQUE INDEX "usuarios_celular_key" ON "usuarios"("celular");
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");
CREATE INDEX "recuperaciones_clave_usuario_id_idx" ON "recuperaciones_clave"("usuario_id");

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recuperaciones_clave"
  ADD CONSTRAINT "recuperaciones_clave_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
