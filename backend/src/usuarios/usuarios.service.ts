import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  obtenerEstado() {
    return {
      modulo: "usuarios",
      estado: "pendiente"
    };
  }

  listarVeterinarios() {
    return this.prisma.usuario.findMany({
      where: {
        rol: "VETERINARIO",
        activo: true,
        eliminadoEn: null
      },
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      select: this.camposVeterinario()
    });
  }

  private camposVeterinario() {
    return {
      id: true,
      nombres: true,
      apellidos: true,
      correo: true,
      celular: true,
      activo: true
    } satisfies Prisma.UsuarioSelect;
  }
}
