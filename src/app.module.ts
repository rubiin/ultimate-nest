import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from '@lib/i18n/i18n.module';
import { app, jwt, redis, mail, database } from '@lib/config/configs';
import { WinstonModule } from '@lib/winston/winston.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		I18nModule,
		WinstonModule,
		ConfigModule.forRoot({
			envFilePath: ['dev.env'],
			load: [app, jwt, redis, mail, database],
			cache: false,
			isGlobal: true,
			expandVariables: true,
		}),
	],
})
export class AppModule {}
