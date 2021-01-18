import { Global, Module } from '@nestjs/common';
import {
	AcceptLanguageResolver,
	HeaderResolver,
	I18nJsonParser,
	I18nModule as NestI18nModule,
	QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
@Global()
@Module({
	exports: [NestI18nModule],
	imports: [
		NestI18nModule.forRoot({
			fallbackLanguage: 'en',
			parser: I18nJsonParser,
			parserOptions: {
				path: path.join(process.cwd(), '/src/i18n/'),
			},
			resolvers: [
				{ use: QueryResolver, options: ['lang', 'locale', 'l'] },
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
			],
		}),
	],
})
export class I18nModule {}
