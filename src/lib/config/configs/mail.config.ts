/* eslint-disable unicorn/no-thenable  */
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const mail = registerAs("mail", () => ({
	username: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT ? +process.env.MAIL_PORT : 587,
	server: process.env.MAIL_SERVER,
	previewEmail: process.env.MAIL_PREVIEW_EMAIL === "true",
	templateDir: process.env.MAIL_TEMPLATE_DIR,
	senderEmail: process.env.MAIL_SENDER_EMAIL,
	sesKey: process.env.MAIL_SES_KEY,
	sesAccessKey: process.env.MAIL_SES_ACCESS_KEY,
	sesRegion: process.env.MAIL_SES_REGION,
}));

export const mailConfigValidationSchema = {
	MAIL_SERVER: Joi.string().required().valid("SMTP", "SES"),
	MAIL_USERNAME: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
	MAIL_PASSWORD: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
	MAIL_HOST: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
	MAIL_PORT: Joi.number().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
	MAIL_PREVIEW_EMAIL: Joi.boolean().default(false).required(),
	MAIL_TEMPLATE_DIR: Joi.string().required(),
	MAIL_SENDER_EMAIL: Joi.string().required(),
	MAIL_SES_KEY: Joi.string().when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
	MAIL_SES_ACCESS_KEY: Joi.string().when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
	MAIL_SES_REGION: Joi.string().when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
};
