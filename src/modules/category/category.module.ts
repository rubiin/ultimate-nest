import { Module } from "@nestjs/common";

import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { FastJwtModule } from "@lib/fast-jwt/fast-jwt.module";
import { NestConfigModule } from "@lib/config/config.module";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		FastJwtModule.registerAsync({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService<Configs, true>) => ({
				isGlobal: true,
				secret: configService.get("jwt.secret", { infer: true }),
				signOptions: {
					expiresIn: configService.get("jwt.accessExpiry", { infer: true }),
					algorithm: "ES256",
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [CategoryController],
	providers: [CategoryService],
})
export class CategoryModule {}
