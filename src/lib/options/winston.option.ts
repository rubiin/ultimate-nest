import transports from '@lib/winston/winston-transports';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export class WinstonConfig {
	createWinstonModuleOptions(): WinstonModuleOptions {
		return {
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
		};
	}
}
