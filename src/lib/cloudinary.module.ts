import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "nestjs-cloudinary";

@Module({
	imports: [
		CloudinaryModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService<Configs, true>) => ({
				isGlobal: true,
				cloud_name: configService.get("cloudinary.cloud_name", { infer: true }),
				api_key: configService.get("cloudinary.api_key", { infer: true }),
				api_secret: configService.get("cloudinary.api_secret", { infer: true }),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CloudinaryModule],
})
export class NestCloudinaryModule {}
