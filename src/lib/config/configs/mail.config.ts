import process from "node:process";

import { SES_REGIONS } from "@common/constant";
import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envPort, envString, oneOf } from "./schema.helpers";

const requiredCredentials = {
  SES: ["MAIL_SES_ACCESS_KEY", "MAIL_SES_KEY", "MAIL_SES_REGION"],
  SMTP: ["MAIL_HOST", "MAIL_PASSWORD", "MAIL_PORT", "MAIL_USERNAME"],
} as const;

export const mailConfigValidationSchema = z
  .object({
    MAIL_SERVER: z.enum(["SMTP", "SES"]),
    MAIL_USERNAME: envString().optional(),
    MAIL_PASSWORD: envString().optional(),
    MAIL_HOST: envString().optional(),
    MAIL_PORT: envPort().optional(),
    MAIL_PREVIEW_EMAIL: z.stringbool().default(false),
    MAIL_BCC_LIST: envString().optional(),
    MAIL_TEMPLATE_DIR: envString(),
    MAIL_SENDER_EMAIL: envString(),
    MAIL_SES_KEY: envString().optional(),
    MAIL_SES_ACCESS_KEY: envString().optional(),
    MAIL_SES_REGION: oneOf(SES_REGIONS).optional(),
  })
  .superRefine((env, ctx) => {
    for (const key of requiredCredentials[env.MAIL_SERVER]) {
      if (env[key] === undefined) {
        ctx.addIssue({
          code: "custom",
          message: `${key} is required when MAIL_SERVER is ${env.MAIL_SERVER}`,
          path: [key],
        });
      }
    }
  });

export const mail = registerAs("mail", () => ({
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ?? +process.env.MAIL_PORT,
  type: process.env.MAIL_SERVER,
  previewEmail: process.env.MAIL_PREVIEW_EMAIL,
  bccList: process.env?.MAIL_BCC_LIST?.split(",") ?? [],
  templateDir: process.env.MAIL_TEMPLATE_DIR,
  senderEmail: process.env.MAIL_SENDER_EMAIL,
  sesKey: process.env.MAIL_SES_KEY,
  sesAccessKey: process.env.MAIL_SES_ACCESS_KEY,
  sesRegion: process.env.MAIL_SES_REGION,
}));
