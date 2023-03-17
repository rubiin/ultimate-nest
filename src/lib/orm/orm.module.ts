import { baseOptions } from "@common/database/mikro-orm-cli.config";
import * as Entities from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { defineConfig as definePgConfig } from "@mikro-orm/postgresql";
import { defineConfig as defineSqliteConfig } from "@mikro-orm/sqlite";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

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
