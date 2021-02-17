import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@lib/config/config.module';
import { WinstonModule } from '@lib/winston/winston.module';
import { OrmModule } from '@lib/orm/orm.module';
import {
	I18nJsonParser,
	QueryResolver,
	HeaderResolver,
	AcceptLanguageResolver,
	I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@common/filter/AllExceptionTranslatable';

@Module({
	providers: [
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
	imports: [
		AuthModule,
		UserModule,
		WinstonModule,
		ConfigModule,
		OrmModule,
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			parser: I18nJsonParser,
			parserOptions: {
				path: path.join(__dirname, '/i18n/'),
			},
			resolvers: [
				{ use: QueryResolver, options: ['lang', 'locale', 'l'] },
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
			],
		}),
	],
})
export class AppModule {}
