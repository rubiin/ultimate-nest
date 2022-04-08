import { Database, Resource } from "@adminjs/mikroorm";
import { AdminModule } from "@adminjs/nestjs";
import { roles } from "@common/constants/app.roles";
import { NestConfigModule } from "@lib/config/config.module";
import { NestI18nModule } from "@lib/i18n/i18n.module";
import { OrmModule } from "@lib/orm/orm.module";
import { NestPinoModule } from "@lib/pino/pino.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import AdminJS from "adminjs";
import { adminjsConfig } from "./adminJs.config";
import { AccessControlModule } from "nest-access-control";
import { join } from "path";

AdminJS.registerAdapter({ Database, Resource });

@Module({
	imports: [
		AuthModule,
		UserModule,
		PostModule,
		OrmModule,
		NestConfigModule,
		NestPinoModule,
		NestI18nModule,
		AccessControlModule.forRoles(roles),
		AdminModule.createAdminAsync(adminjsConfig),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "resources"),
			serveStaticOptions: {
				maxAge: 86_400, // 1 day
			},
		}),
	],
})
export class AppModule {}
