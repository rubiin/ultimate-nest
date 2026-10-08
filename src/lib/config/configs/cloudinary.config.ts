import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const cloudinaryConfigValidationSchema = z.object({
  CLOUDINARY_CLOUD_NAME: envString(),
  CLOUDINARY_API_KEY: envString(),
  CLOUDINARY_API_SECRET: envString(),
});

export const cloudinary = registerAs("cloudinary", () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
