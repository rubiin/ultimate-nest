import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import transports from '@common/utils/winstonTransports';
import { AuthModule } from '@modules/auth/auth.module';
import { OrmModule } from '@lib/orm/orm.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@lib/config/config.module';
import { I18nModule } from '@lib/i18n/i18n.module';

@Module({
	imports: [
		OrmModule,
		AuthModule,
		UserModule,
		I18nModule,
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
export class AppModule {}
