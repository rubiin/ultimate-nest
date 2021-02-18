import { registerAs } from '@nestjs/config';

export const minio = registerAs('minio', () => ({
	host: process.env.MINIO_HOST,
	port: +process.env.MINIO_PORT,
	accessKey: process.env.MINIO_ACCESS_KEY,
	secretKey: process.env.MINIO_SECRET_KEY,
	useSSl: JSON.parse(process.env.MINIO_USE_SSL),
}));
