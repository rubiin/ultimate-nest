import { Global, Module } from '@nestjs/common';
import {
	ConfigModule as NestJsConfigModule,
	ConfigService,
} from '@nestjs/config';
import { app, database, jwt, mail, redis } from './configs';
import { validationSchema } from './validateConfig';

@Global()
@Module({
	imports: [
		NestJsConfigModule.forRoot({
			envFilePath: [`dev.env`],
			load: [app, jwt, redis, mail, database],
			cache: true,
			isGlobal: true,
			expandVariables: true,
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class ConfigModule {}
