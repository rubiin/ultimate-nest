import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const twilioConfigValidationSchema = z.object({
  TWILIO_ACCOUNT_SID: envString(),
  TWILIO_AUTH_TOKEN: envString(),
  TWILIO_FROM: envString(),
});

export const twilio = registerAs("twilio", () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  from: process.env.TWILIO_FROM,
}));
