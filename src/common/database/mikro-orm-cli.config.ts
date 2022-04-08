import { Options } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import * as dotenv from "dotenv";
import * as dotEnvExpand from "dotenv-expand";
import * as chalk from "chalk";

/**
 * This is required to run mikro-orm cli
 *
 */

const myEnv = dotenv.config({
	path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}`,
});

dotEnvExpand.expand(myEnv);

console.info(
	chalk.green(`Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}`),
);

const config = {
	dbName: process.env.DB_DATABASE,
	debug: true,
	entities: ["dist/**/*.entity.js"],
	entitiesTs: ["src/**/*.entity.ts"],
	host: process.env.DB_HOST,
	migrations: {
		path: "dist/migrations/",
		pathTs: "src/migrations/",
		tableName: "migrations",
		transactional: true,
	},
	seeder: {
		path: "./src/seeders", // path to the folder with seeders
		defaultSeeder: "DatabaseSeeder", // default seeder class name
	},
	password: process.env.DB_PASSWORD,
	port: +process.env.DB_PORT,
	type: "postgresql",
	highlighter: new SqlHighlighter(),
	user: process.env.DB_USERNAME,
	metadataProvider: TsMorphMetadataProvider,
} as Options;

export default config;
