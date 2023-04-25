import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const cloudinaryConfigValidationSchema = {
	CLOUDINARY_CLOUD_NAME: Joi.string().required(),
	CLOUDINARY_API_KEY: Joi.string().required(),
	CLOUDINARY_API_SECRET: Joi.string().required(),
};

export const cloudinary = registerAs("cloudinary", () => ({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
}));
