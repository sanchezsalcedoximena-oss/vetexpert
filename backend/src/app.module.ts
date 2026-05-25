import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { CitasModule } from "./citas/citas.module";
import { ClientesModule } from "./clientes/clientes.module";
import { ConfiguracionModule } from "./configuracion/configuracion.module";
import { ContactoModule } from "./contacto/contacto.module";
import { ConsultasModule } from "./consultas/consultas.module";
import { HistoriasClinicasModule } from "./historias-clinicas/historias-clinicas.module";
import { MantenimientoModule } from "./mantenimiento/mantenimiento.module";
import { MascotasModule } from "./mascotas/mascotas.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { ReportesModule } from "./reportes/reportes.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { VacunasModule } from "./vacunas/vacunas.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    PrismaModule,
    ContactoModule,
    AuthModule,
    UsuariosModule,
    ClientesModule,
    MascotasModule,
    CitasModule,
    HistoriasClinicasModule,
    ConsultasModule,
    VacunasModule,
    ReportesModule,
    ConfiguracionModule,
    MantenimientoModule
  ]
})
export class AppModule {}
