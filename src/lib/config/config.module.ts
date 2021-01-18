import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestJsConfigModule } from '@nestjs/config';
import { database, app } from './configuration';
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
})
export class ConfigModule {}
