import * as Joi from 'joi';

export const validationSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid('development', 'production', 'test', 'provision')
		.default('development')
		.required(),
	APP_PORT: Joi.number().default(8000),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().default(5432),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().required(),
	REDIS_PORT: Joi.number().default(6379),
	REDIS_HOST: Joi.string().required(),
});
