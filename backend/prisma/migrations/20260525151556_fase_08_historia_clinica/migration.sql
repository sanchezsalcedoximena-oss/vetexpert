-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "observaciones" TEXT,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "cita_id" UUID NOT NULL,
    "mascota_id" UUID NOT NULL,
    "veterinario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "eliminado_en" TIMESTAMP(3),

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_cita_id_key" ON "historias_clinicas"("cita_id");

-- CreateIndex
CREATE INDEX "historias_clinicas_mascota_id_idx" ON "historias_clinicas"("mascota_id");

-- CreateIndex
CREATE INDEX "historias_clinicas_veterinario_id_idx" ON "historias_clinicas"("veterinario_id");

-- CreateIndex
CREATE INDEX "historias_clinicas_fecha_idx" ON "historias_clinicas"("fecha");

-- CreateIndex
CREATE INDEX "historias_clinicas_cerrada_idx" ON "historias_clinicas"("cerrada");

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_mascota_id_fkey" FOREIGN KEY ("mascota_id") REFERENCES "mascotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_veterinario_id_fkey" FOREIGN KEY ("veterinario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
