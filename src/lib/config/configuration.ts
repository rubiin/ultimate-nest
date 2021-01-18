import { registerAs } from '@nestjs/config';

export const database = registerAs('database', () => ({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	username: process.env.DB_USERNAME,
	dbName: process.env.DB_DATABASE,
}));

export const app = registerAs('app', () => ({
	port: process.env.APP_PORT,
}));

export const redis = registerAs('redis', () => ({
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
}));

export const jwt = registerAs('redis', () => ({
	secret: process.env.JWT_SECRET,
	accessExpiry: process.env.JWT_ACCESS_EXPIRY,
	refreshExpiry: process.env.JWT_REFRESH_EXPIRY,
}));

export const mail = registerAs('mail', () => ({
	username: process.env.MAIL_USER,
	passowrd: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
}));
