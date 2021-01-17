import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@common/interceptor/logger.interceptor';
import transports from '@utils/winstonTransports';
import { AuthModule } from '@modules/auth/auth.module';
import { OrmModule } from '@modules/orm/orm.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		OrmModule,
		AuthModule,
		UserModule,
		ConfigModule,
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
