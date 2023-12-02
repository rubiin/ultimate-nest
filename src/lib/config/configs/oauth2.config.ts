import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const facebookOauthConfigValidationSchema = {
  FACEBOOK_CLIENT_ID: Joi.string().required(),
  FACEBOOK_CLIENT_SECRET: Joi.string().required(),
  FACEBOOK_CALLBACK_URL: Joi.string().uri().required(),
};

export const googleOauthConfigValidationSchema = {
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
};

export const googleOauth = registerAs("googleOauth", () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  secret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));

export const facebookOauth = registerAs("facebookOauth", () => ({
  clientId: process.env.FACEBOOK_CLIENT_ID,
  secret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
}));
