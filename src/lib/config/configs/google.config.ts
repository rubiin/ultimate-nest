import { registerAs } from "@nestjs/config";

export const googleOauth = registerAs("googleOauth", () => ({
	clientId: process.env.GOOGLE_CLIENT_ID,
	secret: process.env.GOOGLE_CLIENT_SECRET,
	callbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));
