import Joi from "joi";

export default Joi.object().keys({
	app: Joi.object().keys({
		prefix: Joi.string().required(),
		port: Joi.number().required(),
	}),
	db: Joi.object().keys({
		host: Joi.string().required(),
		username: Joi.string().required(),
		database: Joi.string().required(),
		password: Joi.string().required(),
		port: Joi.number().required(),
	}),
	enc: Joi.object().keys({
		key: Joi.string().required(),
		iv: Joi.string().required(),
	}),
	jwt: Joi.object().keys({
		secret: Joi.string().required(),
		access_expiry: Joi.number().required(),
		refresh_expiry: Joi.string().required(),
	}),
	redis: Joi.object().keys({
		ttl: Joi.number().required(),
		uri: Joi.string().required(),
	}),
	mail: Joi.object().keys({
		host: Joi.string().required(),
		username: Joi.string().required(),
		password: Joi.string().required(),
		template_dir: Joi.string().required(),
		sender_email: Joi.string().required(),
		preview_email: Joi.boolean().required(),
		port: Joi.number().required(),
	}),
	cloudinary: Joi.object().keys({
		cloud_name: Joi.string().required(),
		api_key: Joi.string().required(),
		secret_key: Joi.string().required(),
	}),
	rabbit: Joi.object().keys({
		uri: Joi.string().required(),
		exchange: Joi.string().required(),
	}),
	sentry: Joi.object().keys({
		dsn: Joi.string().required(),
	}),
});
