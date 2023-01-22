import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const mail = registerAs("mail", () => ({
	username: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: +process.env.MAIL_PORT,
	server: process.env.MAIL_SERVER,
	previewEmail: JSON.parse(process.env.MAIL_PREVIEW_EMAIL),
	templateDir: process.env.MAIL_TEMPLATE_DIR,
	senderEmail: process.env.MAIL_SENDER_EMAIL,
}));

export const mailConfigValidationSchema = {
	MAIL_USERNAME: Joi.string().required(),
	MAIL_PASSWORD: Joi.string().required(),
	MAIL_HOST: Joi.string().required(),
	MAIL_PORT: Joi.number().required(),
	MAIL_PREVIEW_EMAIL: Joi.boolean().default(false).required(),
	MAIL_TEMPLATE_DIR: Joi.string().required(),
	MAIL_SENDER_EMAIL: Joi.string().required(),
	MAIL_SERVER: Joi.string().required(),
};
