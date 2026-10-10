import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "nestjs-cloudinary";

@Global()
@Module({
  exports: [CloudinaryModule],
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        api_key: configService.get("cloudinary.apiKey", { infer: true }),
        api_secret: configService.get("cloudinary.apiSecret", { infer: true }),
        cloud_name: configService.get("cloudinary.cloudName", { infer: true }),
        isGlobal: true,
      }),
    }),
  ],
})
export class NestCloudinaryModule {}
