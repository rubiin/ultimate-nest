import { registerAs } from '@nestjs/config';

console.info('some logg', process.env.NODE_ENV);

export const database = registerAs('database', () => ({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	username: process.env.DB_USERNAME,
	dbName: process.env.DB_DATABASE,
}));
