import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { GoogleMockDto } from "./dto/google-mock.dto";
import { LoginDto } from "./dto/login.dto";
import { RecuperarContrasenaDto } from "./dto/recuperar-contrasena.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegistroClienteDto } from "./dto/registro-cliente.dto";
import { AuthService } from "./auth.service";
import { JwtPayload } from "./types/jwt-payload.type";

type RequestConUsuario = Request & {
  user: JwtPayload;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("estado")
  obtenerEstado() {
    return this.authService.obtenerEstado();
  }

  @Post("staff/login")
  loginStaff(@Body() dto: LoginDto) {
    return this.authService.loginStaff(dto);
  }

  @Post("staff/google")
  loginGoogleStaff(@Body() dto: GoogleMockDto) {
    return this.authService.loginGoogleStaff(dto);
  }

  @Post("clientes/registro")
  registrarCliente(@Body() dto: RegistroClienteDto) {
    return this.authService.registrarCliente(dto);
  }

  @Post("refresh")
  refrescarToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refrescarToken(dto);
  }

  @Post("recuperar")
  recuperarContrasena(@Body() dto: RecuperarContrasenaDto) {
    return this.authService.recuperarContrasena(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("perfil")
  obtenerPerfil(@Req() request: RequestConUsuario) {
    return this.authService.obtenerPerfil(request.user);
  }
}
