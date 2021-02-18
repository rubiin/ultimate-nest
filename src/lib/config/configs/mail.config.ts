import { registerAs } from '@nestjs/config';

export const mail = registerAs('mail', () => ({
	username: process.env.MAIL_USER,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: +process.env.MAIL_PORT,
}));
