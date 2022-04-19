import { NestConfigModule } from "@lib/config/config.module";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "./cloudinary.module";

@Global()
@Module({
	imports: [
		CloudinaryModule.forRootAsync(CloudinaryModule, {
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
				cloudName: configService.get("cloudinary.cloud_name"),
				apiKey: configService.get("cloudinary.api_key"),
				apiSecret: configService.get("cloudinary.secret_key"),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CloudinaryModule],
})
export class NestCloudinaryModule {}
