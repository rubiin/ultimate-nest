import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestMinioModule } from "nestjs-minio";

@Module({
	imports: [
		NestMinioModule.registerAsync({
			imports: [NestConfigModule],
			isGlobal: true,
			useFactory: async (configService: ConfigService) => ({
				endPoint: configService.get<string>("minio.host"),
				port: configService.get<number>("minio.port"),
				accessKey: configService.get<string>("minio.accessKey"),
				secretKey: configService.get<string>("minio.secretKey"),
				useSSL: configService.get<boolean>("minio.ssl"),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [NestMinioModule],
})
export class MinioModule {}
