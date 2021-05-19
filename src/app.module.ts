import { AdminModule } from '@admin-bro/nestjs';
import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { WinstonModule } from '@lib/winston/winston.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PostModule } from '@modules/post/post.module';
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
		AdminModule.createAdmin({
			adminBroOptions: {
				rootPath: '/admin',
				resources: [],
			},
			auth: {
				authenticate: async (_email, _password) =>
					Promise.resolve({ email: 'test' }),
				cookieName: 'test',
				cookiePassword: 'testPass',
			},
		}),
		AuthModule,
		UserModule,
		WinstonModule,
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
		}),
		PostModule,
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
