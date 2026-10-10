import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";

@Global()
@Module({
  exports: [NestMinioModule],
  imports: [
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) =>
        configService.getOrThrow("minio", { infer: true }),
    }),
  ],
})
export class MinioModule {}
