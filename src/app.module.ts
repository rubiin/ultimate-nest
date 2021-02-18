import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@lib/config/config.module';
import { WinstonModule } from '@lib/winston/winston.module';
import { OrmModule } from '@lib/orm/orm.module';
import {
	I18nJsonParser,
	HeaderResolver,
	AcceptLanguageResolver,
	I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';
import { IdeaModule } from '@modules/idea/idea.module';

@Module({
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
				path: path.join(__dirname, '/resources/i18n/'),
			},
			resolvers: [
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
			],
		}),
		IdeaModule,
	],
})
export class AppModule {}
