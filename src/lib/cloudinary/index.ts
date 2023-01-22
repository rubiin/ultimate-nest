import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CloudinaryModule } from "nestjs-cloudinary";

@Module({
	imports: [
		CloudinaryModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
				isGlobal: true,
				cloud_name: configService.get<string>("cloudinary.cloudName"),
				api_key: configService.get<string>("cloudinary.apiKey"),
				api_secret: configService.get<string>("cloudinary.apiSecret"),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CloudinaryModule],
})
export class NestCloudinaryModule {}
