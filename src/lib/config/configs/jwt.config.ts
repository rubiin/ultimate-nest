import { registerAs } from '@nestjs/config';

export const jwt = registerAs('jwt', () => ({
	secret: process.env.JWT_SECRET,
	accessExpiry: process.env.JWT_ACCESS_EXPIRY,
	refreshExpiry: Number(process.env.JWT_REFRESH_EXPIRY),
}));
