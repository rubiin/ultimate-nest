import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { WinstonModule } from '@lib/winston/winston.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProductsModule } from '@modules/products/products.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
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
		ProductsModule,
	],
})
export class AppModule {}
