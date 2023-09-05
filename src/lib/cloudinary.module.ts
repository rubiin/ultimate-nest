import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "nestjs-cloudinary";

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        isGlobal: true,
        cloud_name: configService.get("cloudinary.cloud_name", { infer: true }),
        api_key: configService.get("cloudinary.api_key", { infer: true }),
        api_secret: configService.get("cloudinary.api_secret", { infer: true }),
      }),
    }),
  ],
  exports: [CloudinaryModule],
})
export class NestCloudinaryModule {}
