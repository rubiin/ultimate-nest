import { TEmailSubject } from "../types";

export enum EmailTemplate {
	"RESET_PASSWORD_TEMPLATE" = "reset",
	"WELCOME_TEMPLATE" = "welcome",
	"MAGIC_LOGIN_TEMPLATE" = "magiclogin",
	"NEWSLETTER_TEMPLATE" = "newsletter",
}

export const EmailSubject: Record<TEmailSubject, string> = {
	RESET_PASSWORD: "Reset your password",
	WELCOME: "Welcome to the app",
	MAGIC_LOGIN: "Login to the app",
	NEWSLETTER: "Newsletter",
};

export enum FileSize {
	IMAGE = 5 * 1024 * 1024, // 5MB
	DOC = 10 * 1024 * 1024, // 10MB
}

export enum PostStateEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
}

export const FileType: Record<keyof typeof FileSize, RegExp> = {
	IMAGE: new RegExp(/(jpg|jpeg|png|gif|svg)$/i),
	DOC: new RegExp(/(pdf|doc|txt|key|csv|docx|xls|xlsx|ppt|pptx)$/i),
};

// database enums

export enum CursorType {
	DATE = "DATE",
	STRING = "STRING",
	NUMBER = "NUMBER",
}

export enum QueryCursor {
	DATE = "DATE",
	ALPHA = "ALPHA",
}

export enum QueryOrder {
	ASC = "ASC",
	DESC = "DESC",
}

export const enum RoutingKey {
	SEND_MAIL = "send-mail",
}

export enum PaginationType {
	OFFSET = "offset",
	CURSOR = "cursor",
}
