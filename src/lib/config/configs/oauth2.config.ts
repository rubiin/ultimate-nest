import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const facebookOauthConfigValidationSchema = z.object({
  FACEBOOK_CLIENT_ID: envString(),
  FACEBOOK_CLIENT_SECRET: envString(),
  FACEBOOK_CALLBACK_URL: z.url(),
});

export const googleOauthConfigValidationSchema = z.object({
  GOOGLE_CLIENT_ID: envString(),
  GOOGLE_CLIENT_SECRET: envString(),
  GOOGLE_CALLBACK_URL: z.url(),
});

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
