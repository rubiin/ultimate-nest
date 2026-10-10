import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
  exports: [JwtModule],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // The module is already `@Global()`; `isGlobal` here would register the
      // JwtModule a second time.
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        secret: configService.get("jwt.secret", { infer: true }),
        signOptions: {
          algorithm: configService.get("jwt.algorithm", { infer: true }),
          expiresIn: configService.get("jwt.accessExpiry", { infer: true }),
        },
      }),
    }),
  ],
})
export class NestJwtModule {}
