import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthMiddleware } from "../common/middleware/auth.middleware";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthMiddleware,
    {
      provide: JwtService,
      useFactory: () =>
        new JwtService({
          secret: process.env.JWT_ACCESS_SECRET ?? "vetexpert_access_secret_local",
          signOptions: {
            expiresIn: "15m"
          }
        })
    }
  ],
  exports: [AuthService]
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: "auth/perfil",
      method: RequestMethod.GET
    });
  }
}
