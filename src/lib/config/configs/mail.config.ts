import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";
import { SES_REGIONS } from "@common/constant";

export const mailConfigValidationSchema = {
  MAIL_SERVER: Joi.string().required().valid("SMTP", "SES"),
  MAIL_USERNAME: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
  MAIL_PASSWORD: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
  MAIL_HOST: Joi.string().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
  MAIL_PORT: Joi.number().port().when("MAIL_SERVER", { is: "SMTP", then: Joi.required() }),
  MAIL_PREVIEW_EMAIL: Joi.boolean().default(false).optional(),
  MAIL_BCC_LIST: Joi.string().optional(),
  MAIL_TEMPLATE_DIR: Joi.string().required(),
  MAIL_SENDER_EMAIL: Joi.string().required(),
  MAIL_SES_KEY: Joi.string().when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
  MAIL_SES_ACCESS_KEY: Joi.string().when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
  MAIL_SES_REGION: Joi.string()
    .valid(...SES_REGIONS)
    .when("MAIL_SERVER", { is: "SES", then: Joi.required() }),
};

export const mail = registerAs("mail", () => ({
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ?? +process.env.MAIL_PORT,
  type: process.env.MAIL_SERVER,
  previewEmail: process.env.MAIL_PREVIEW_EMAIL,
  bccList: process.env?.MAIL_BCC_LIST ? process.env.MAIL_BCC_LIST.split(",") : [],
  templateDir: process.env.MAIL_TEMPLATE_DIR,
  senderEmail: process.env.MAIL_SENDER_EMAIL,
  sesKey: process.env.MAIL_SES_KEY,
  sesAccessKey: process.env.MAIL_SES_ACCESS_KEY,
  sesRegion: process.env.MAIL_SES_REGION,
}));
