import * as Joi from 'joi';

export const validationSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid('development', 'production', 'test', 'provision')
		.required(),
	APP_PORT: Joi.number().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().required(),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().required(),
	ENC_KEY: Joi.string().required().length(64),
	ENC_IV: Joi.string().required().length(32),
	REDIS_HOST: Joi.string().required(),
	REDIS_PORT: Joi.number().required(),
	MAIL_HOST: Joi.string().required(),
	MAIL_PORT: Joi.number().required(),
	MAIL_USER: Joi.string().required(),
	MAIL_PASSWORD: Joi.string().required(),
	MINIO_HOST: Joi.string().required(),
	MINIO_PORT: Joi.number().required(),
	MINIO_ACCESS_KEY: Joi.string().required(),
	MINIO_SECRET_KEY: Joi.string().required(),
	MINIO_USE_SSL: Joi.boolean().required(),
});
