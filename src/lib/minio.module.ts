import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";

@Module({
  imports: [
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get("minio.host"),
        port: configService.get("minio.port"),
        accessKey: configService.get("minio.accessKey"),
        secretKey: configService.get("minio.secretKey"),
        useSSL: configService.get("minio.ssl"),
      }),
    }),
  ],
  exports: [NestMinioModule],
})
export class MinioModule {}
