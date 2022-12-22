import { registerAs } from "@nestjs/config";

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
