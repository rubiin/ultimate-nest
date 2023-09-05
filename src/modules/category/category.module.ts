import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FastJwtModule } from "nestjs-fastjwt";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";

@Module({
  imports: [
    FastJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        isGlobal: true,
        secret: configService.get("jwt.secret", { infer: true }),
        signOptions: {
          expiresIn: configService.get("jwt.accessExpiry", { infer: true }),
        },
      }),
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
