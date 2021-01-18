import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

@Global()
@Module({
	exports: [NestJwtModule],
	imports: [
		NestJwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('jwt.secret'),
				signOptions: {
					expiresIn: configService.get<number>('jwt.accessExpiry'),
				},
			}),
			inject: [ConfigService],
		}),
	],
})
export class JwtModule {}
