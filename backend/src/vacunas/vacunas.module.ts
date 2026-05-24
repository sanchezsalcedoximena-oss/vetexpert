import { Module } from "@nestjs/common";
import { VacunasController } from "./vacunas.controller";
import { VacunasService } from "./vacunas.service";

@Module({
  controllers: [VacunasController],
  providers: [VacunasService],
  exports: [VacunasService]
})
export class VacunasModule {}
