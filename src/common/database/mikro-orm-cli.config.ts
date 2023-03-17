import { LoadStrategy, Options } from "@mikro-orm/core";
import { defineConfig as definePGConfig } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { defineConfig as defineSqliteConfig } from "@mikro-orm/sqlite";
import { Logger, NotFoundException } from "@nestjs/common";
import dotenv from "dotenv";
import dotEnvExpand from "dotenv-expand";

import { BaseRepository } from "./base.repository";

/**
 *
 * `MikroOrmConfig` is a configuration object for `MikroORM` that is used to
 * This is required to run mikro-orm cli
 *
 */

const logger = new Logger("MikroORM");

const myEnvironment = dotenv.config({
	path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}`,
});

dotEnvExpand.expand(myEnvironment);

logger.debug(`🛠️  Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}\n`);

export const baseOptions = {
	entities: ["dist/entities/*.entity.js"],
	entitiesTs: ["src/entities/*.entity.ts"],
	findOneOrFailHandler: (entityName: string, key: any) => {
		return new NotFoundException(`${entityName} not found for ${key}`);
	},
	migrations: {
		path: "./dist/migrations",
		pathTs: "./migrations",
		tableName: "migrations",
		transactional: true,
		glob: "!(*.d).{js,ts}",
		//	emit: "ts",
	},
	seeder: {
		path: "dist/common/database/seeders/", // path to the folder with seeders
		pathTs: "src/common/database/seeders/", // path to the folder with seeders
		defaultSeeder: "DatabaseSeeder", // default seeder class name
		glob: "!(*.d).{js,ts}", // how to match seeder files (all .js and .ts files, but not .d.ts)
		//	emit: "ts", // seeder generation mode
	},
	logger: logger.debug.bind(logger),
	metadataProvider: TsMorphMetadataProvider,
	highlighter: new SqlHighlighter(),
	debug: true,
	loadStrategy: LoadStrategy.JOINED,
	entityRepository: BaseRepository,
	allowGlobalContext: true,
	registerRequestContext: false,
	pool: { min: 2, max: 10 },
};

const config: Options = process.env.NODE_ENV.startsWith("prod")
	? definePGConfig({
			...baseOptions,
			dbName: process.env.DB_DATABASE,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			user: process.env.DB_USERNAME,
			host: process.env.DB_HOST,
	  })
	: defineSqliteConfig({
			...baseOptions,
			dbName: ":memory:",
	  });

export default config;
