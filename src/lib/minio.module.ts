import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";

@Module({
  exports: [NestMinioModule],
  imports: [
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService<Configs, true>) =>
        configService.getOrThrow("minio", { infer: true }),
    }),
  ],
})
export class MinioModule {}
