import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
	exports: [JwtModule],
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				isGlobal: true,
				secret: configService.get("jwt.secret"),
				signOptions: {
					expiresIn: configService.get("jwt.accessExpiry"),
					algorithm: "HS256",
				},
			}),
			inject: [ConfigService],
		}),
	],
})
export class NestJwtModule {}
