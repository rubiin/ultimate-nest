import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PostModule } from '@modules/post/post.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
	AcceptLanguageResolver,
	HeaderResolver,
	I18nModule,
	QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { join } from 'path';

@Module({
	imports: [
		AuthModule,
		UserModule,
		PostModule,
		ConfigModule,
		OrmModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, 'resources'),
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, '/resources/i18n/'),
				watch: true,
			},
			resolvers: [
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
				{ use: QueryResolver, options: ['lang'] },
			],
		}),
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
