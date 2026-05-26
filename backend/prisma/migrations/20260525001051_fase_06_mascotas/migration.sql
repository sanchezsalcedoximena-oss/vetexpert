-- CreateTable
CREATE TABLE "mascotas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT,
    "sexo" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "peso" DECIMAL(6,2),
    "color" TEXT,
    "esterilizado" BOOLEAN NOT NULL DEFAULT false,
    "alergias" TEXT,
    "observaciones" TEXT,
    "foto_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "cliente_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "eliminado_en" TIMESTAMP(3),

    CONSTRAINT "mascotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mascotas_cliente_id_idx" ON "mascotas"("cliente_id");

-- AddForeignKey
ALTER TABLE "mascotas" ADD CONSTRAINT "mascotas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
