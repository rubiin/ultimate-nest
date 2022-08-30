import { registerAs } from "@nestjs/config";

export const mail = registerAs("mail", () => ({
	username: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: +process.env.MAIL_PORT,
	server: process.env.MAIL_SERVER,
	previewEmail: JSON.parse(process.env.MAIL_PREVIEW_EMAIL),
	templateDir: process.env.MAIL_TEMPLATE_DIR,
	senderEmail: process.env.MAIL_SENDER_EMAIL,
}));
