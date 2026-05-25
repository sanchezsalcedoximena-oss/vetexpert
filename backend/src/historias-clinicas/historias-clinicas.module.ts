import { Module } from "@nestjs/common";
import { HistoriasClinicasController } from "./historias-clinicas.controller";
import { HistoriasClinicasService } from "./historias-clinicas.service";

@Module({
  controllers: [HistoriasClinicasController],
  providers: [HistoriasClinicasService],
  exports: [HistoriasClinicasService]
})
export class HistoriasClinicasModule {}
