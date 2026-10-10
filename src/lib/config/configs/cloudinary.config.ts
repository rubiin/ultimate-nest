import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const cloudinaryConfigValidationSchema = z.object({
  CLOUDINARY_API_KEY: envString(),
  CLOUDINARY_API_SECRET: envString(),
  CLOUDINARY_CLOUD_NAME: envString(),
});

export const cloudinary = registerAs("cloudinary", () => ({
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
}));
