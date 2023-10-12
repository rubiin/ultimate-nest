import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";

@Module({
  imports: [
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        endPoint: configService.get("minio.host",{ infer: true }),
        port: configService.get("minio.port",{ infer: true }),
        accessKey: configService.get("minio.accessKey",{ infer: true }),
        secretKey: configService.get("minio.secretKey",{ infer: true }),
        useSSL: configService.get("minio.ssl",{ infer: true }),
      }),
    }),
  ],
  exports: [NestMinioModule],
})
export class MinioModule {}
