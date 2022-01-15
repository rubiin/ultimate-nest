import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
	AcceptLanguageResolver,
	HeaderResolver,
	I18nJsonParser,
	I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
	imports: [
		AuthModule,
		UserModule,
		ConfigModule,
		OrmModule,
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			parser: I18nJsonParser,
			parserOptions: {
				path: path.join(__dirname, '/resources/i18n/'),
			},
			resolvers: [
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
			],
		})
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
