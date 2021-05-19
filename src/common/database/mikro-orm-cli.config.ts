import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as dotenv from 'dotenv';

/**
 * This is required to run mikro-orm cli
 *
 */

dotenv.config({ path: `${process.cwd()}/env/${process.env.NODE_ENV}.env` });
console.info(`Using env ${process.cwd()}/env/${process.env.NODE_ENV}.env`)

const config = {
	dbName: process.env.DB_DATABASE,
	debug: true,
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	host: process.env.DB_HOST,
	migrations: {
		path: 'src/migrations/',
		tableName: 'migrations',
		transactional: true,
	},
	password: process.env.DB_PASSWORD,
	port: Number(process.env.DB_PORT),
	type: 'postgresql',
	highlighter: new SqlHighlighter(),
	user: process.env.DB_USERNAME,
} as Options;

export default config;
