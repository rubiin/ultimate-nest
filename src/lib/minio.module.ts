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
        endPoint: configService.get("minio.host") || "localhost",
        port: configService.get("minio.port") || 9000,
        accessKey: configService.get("minio.accessKey") || "minio",
        secretKey: configService.get("minio.secretKey") || "minio",
        useSSL: configService.get("minio.ssl"),
      }),
    }),
  ],
  exports: [NestMinioModule],
})
export class MinioModule {}
