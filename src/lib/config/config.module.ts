import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestJsConfigModule } from '@nestjs/config';
import { app, database } from './configuration';
import { validationSchema } from './validateConfig';

@Global()
@Module({
	imports: [
		NestJsConfigModule.forRoot({
			envFilePath: ['env/dev.env'],
			load: [database, app],
			cache: true,
			isGlobal: true,
			expandVariables: true,
			validationSchema: validationSchema,
		}),
	],
	exports: [NestJsConfigModule],
})
export class ConfigModule {}
