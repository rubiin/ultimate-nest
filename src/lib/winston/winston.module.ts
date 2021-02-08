import { Module } from '@nestjs/common';
import { WinstonModule as NestWinstonModule } from 'nest-winston';
import * as winston from 'winston';
import transports from './winstonTransports';

@Module({
	exports: [NestWinstonModule],
	imports: [
		NestWinstonModule.forRoot({
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.json(),
			),
			defaultMeta: { service: 'Ultimate-template' },
			transports: transports,
			exceptionHandlers: [
				new winston.transports.File({
					filename: 'logs/exceptions.log',
				}),
			],
		}),
	],
})
export class WinstonModule {}
