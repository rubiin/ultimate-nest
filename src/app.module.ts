import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import transports from '@utils/winstonTransports';
import { AuthModule } from '@modules/auth/auth.module';
import { OrmModule } from '@lib/orm/orm.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { app, database } from '@lib/config/configuration';

@Module({
	imports: [
		OrmModule,
		AuthModule,
		UserModule,
		ConfigModule,
		ConfigModule.forRoot({
			envFilePath: ['env/dev.env'],
			load: [database, app],
			cache: true,
			isGlobal: true,
			expandVariables: true,
		}),
		WinstonModule.forRoot({
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.json(),
			),
			defaultMeta: { service: 'Orbis-employee' },
			transports: transports,
			exceptionHandlers: [
				new winston.transports.File({
					filename: 'logs/exceptions.log',
				}),
			],
		}),
	],
})
export class AppModule {}
