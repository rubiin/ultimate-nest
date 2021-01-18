import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as dotenv from 'dotenv';

// this file is for cli usage only

dotenv.config({ path: `${process.cwd()}/env/${process.env.NODE_ENV}env` });

const config = {
	type: 'postgresql',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	dbName: process.env.DB_DATABASE,
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	debug: true,
	highlighter: new SqlHighlighter(),
	metadataProvider: TsMorphMetadataProvider,
} as Options;

export default config;
