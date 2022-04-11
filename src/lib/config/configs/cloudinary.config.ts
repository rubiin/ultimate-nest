import { registerAs } from "@nestjs/config";

export const cloudinary = registerAs("cloudinary", () => ({
	cloudName: process.env.CLOUDINARY_CLOUD_NAME,
	apiKey: process.env.CLOUDINARY_API_KEY,
	apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
