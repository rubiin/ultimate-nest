import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
	exports: [JwtModule],
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
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
