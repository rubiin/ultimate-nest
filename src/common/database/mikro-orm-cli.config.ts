import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as dotenv from 'dotenv';

/**
 * This is required to run mikro-orm cli
 *
 */

dotenv.config({ path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}` });
console.info(`Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}`);

const config = {
	dbName: process.env.DB_DATABASE,
	debug: true,
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	host: process.env.DB_HOST,
	migrations: {
		path: 'dist/migrations/',
		pathTs: 'src/migrations/',
		tableName: 'migrations',
		transactional: true,
	},
	seeder: {
		path: './src/seeders', // path to the folder with seeders
		defaultSeeder: 'UserSeeder', // default seeder class name
	},
	password: process.env.DB_PASSWORD,
	port: +process.env.DB_PORT,
	type: 'postgresql',
	highlighter: new SqlHighlighter(),
	user: process.env.DB_USERNAME,
} as Options;

export default config;
