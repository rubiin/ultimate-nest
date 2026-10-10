import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const facebookOauthConfigValidationSchema = z.object({
  FACEBOOK_CALLBACK_URL: z.url(),
  FACEBOOK_CLIENT_ID: envString(),
  FACEBOOK_CLIENT_SECRET: envString(),
});

export const googleOauthConfigValidationSchema = z.object({
  GOOGLE_CALLBACK_URL: z.url(),
  GOOGLE_CLIENT_ID: envString(),
  GOOGLE_CLIENT_SECRET: envString(),
});

export const googleOauth = registerAs("googleOauth", () => ({
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  clientId: process.env.GOOGLE_CLIENT_ID,
  secret: process.env.GOOGLE_CLIENT_SECRET,
}));

export const facebookOauth = registerAs("facebookOauth", () => ({
  callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
  clientId: process.env.FACEBOOK_CLIENT_ID,
  secret: process.env.FACEBOOK_CLIENT_SECRET,
}));
