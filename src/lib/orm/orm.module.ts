import { BaseRepository } from "@common/database";
import * as Entities from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { LoadStrategy } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { defineConfig as definePGConfig } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { defineConfig as defineSqliteConfig } from "@mikro-orm/sqlite";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

const logger = new Logger("MikroORM");

const baseOptions = {
	entities: ["dist/entities/*.entity.js"],
	entitiesTs: ["src/entities/*.entity.ts"],
	debug: true,
	loadStrategy: LoadStrategy.JOINED,
	highlighter: new SqlHighlighter(),
	metadataProvider: TsMorphMetadataProvider,
	entityRepository: BaseRepository,
	allowGlobalContext: true,
	registerRequestContext: false,
	pool: { min: 2, max: 10 },
	logger: logger.debug.bind(logger),
	migrations: {
		path: "dist/migrations",
		pathTs: "src/migrations",
	},
};

@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService<IConfig, true>) =>
			process.env.NODE_ENV.startsWith("prod")
					? definePGConfig({
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
