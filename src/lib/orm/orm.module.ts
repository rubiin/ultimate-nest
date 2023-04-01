import { baseOptions } from "@common/database/mikro-orm-cli.config";
import * as Entities from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { defineConfig as defineSqliteConfig } from "@mikro-orm/better-sqlite";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { defineConfig as definePgConfig } from "@mikro-orm/postgresql";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService<IConfig, true>) =>
				process.env.NODE_ENV.startsWith("prod")
					? definePgConfig({
							host: configService.get("database.host", { infer: true }),
							port: configService.get("database.port", { infer: true }),
							password: configService.get("database.password", { infer: true }),
							user: configService.get("database.user", { infer: true }),
							dbName: configService.get("database.dbName", { infer: true }),
							...baseOptions,
					  })
					: defineSqliteConfig({
							...baseOptions,
							dbName: ":memory:",
					  }),
			inject: [ConfigService],
		}),
		MikroOrmModule.forFeature({
			entities: Object.values(Entities),
		}),
	],
	exports: [MikroOrmModule],
})
export class OrmModule {}
