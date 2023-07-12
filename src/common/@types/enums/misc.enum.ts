import { TEmailSubject } from "../interfaces";

const BITS_TO_MB = 1024 * 1024;

export enum EmailTemplate {
	RESET_PASSWORD_TEMPLATE = "reset",
	WELCOME_TEMPLATE = "welcome",
	MAGIC_LOGIN_TEMPLATE = "magiclogin",
	NEWSLETTER_TEMPLATE = "newsletter",
}

export const EmailSubject: Record<TEmailSubject, string> = {
	RESET_PASSWORD: "Reset your password",
	WELCOME: "Welcome to the app",
	MAGIC_LOGIN: "Login to the app",
	NEWSLETTER: "Newsletter",
};

export enum FileSize {
	IMAGE = 5 * BITS_TO_MB, // 5MB
	DOC = 10 * BITS_TO_MB, // 10MB
}

export enum PostStateEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
}

export const enum Server {
	SES = "SES",
	SMTP = "SMTP",
}

export const enum TemplateEngine {
	ETA = "ETA",
	PUG = "PUG",
	HBS = "HBS",
}

export const FileType: Record<keyof typeof FileSize, RegExp> = {
	IMAGE: new RegExp(/(jpg|jpeg|png|gif|svg)$/i),
	DOC: new RegExp(/(pdf|doc|txt|key|csv|docx|xls|xlsx|ppt|pptx)$/i),
};

// database enums

export const enum CursorType {
	DATE = "DATE",
	STRING = "STRING",
	NUMBER = "NUMBER",
}

export const enum QueryCursor {
	DATE = "DATE",
	ALPHA = "ALPHA",
}

export enum QueryOrder {
	ASC = "ASC",
	DESC = "DESC",
}

export enum ReferralStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
}

export const enum RoutingKey {
	SEND_MAIL = "send-mail",
	SEND_NEWSLETTER = "send-newsletter",
}

export const enum PaginationType {
	OFFSET = "OFFSET",
	CURSOR = "CURSOR",
}
