import { Options } from "@mikro-orm/core";
import { defineConfig as definePGConfig } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { defineConfig as defineSqliteConfig } from "@mikro-orm/sqlite";
import { Logger } from "@nestjs/common";
import dotenv from "dotenv";
import dotEnvExpand from "dotenv-expand";

/**
 *
 * `MikroOrmConfig` is a configuration object for `MikroORM` that is used to
 * This is required to run mikro-orm cli
 *
 */

const logger = new Logger("MikroORM-CLI");

const myEnvironment = dotenv.config({
	path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}`,
});

dotEnvExpand.expand(myEnvironment);

logger.debug(`🛠️  Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}\n`);

const baseOptions = {
	entities: ["dist/**/*.entity.js"],
	entitiesTs: ["src/**/*.entity.ts"],
	host: process.env.DB_HOST,
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
};

const config: Options =
	process.env.NODE_ENV.startsWith("prod")
		? definePGConfig({
				...baseOptions,
				dbName: process.env.DB_DATABASE,
				password: process.env.DB_PASSWORD,
				port: process.env.DB_PORT,
				user: process.env.DB_USERNAME,
		  })
		: defineSqliteConfig({
				...baseOptions,
				dbName: ":memory:",
		  });

export default config;
