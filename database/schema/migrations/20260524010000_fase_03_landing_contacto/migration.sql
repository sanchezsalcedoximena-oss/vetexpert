CREATE TABLE "mensajes_contacto" (
  "id" UUID NOT NULL,
  "nombres" TEXT NOT NULL,
  "correo" TEXT NOT NULL,
  "celular" TEXT,
  "asunto" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "atendido" BOOLEAN NOT NULL DEFAULT false,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "mensajes_contacto_pkey" PRIMARY KEY ("id")
);
