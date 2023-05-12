import { EmailSubject } from "../types";

export enum EmailTemplateEnum {
	"RESET_PASSWORD_TEMPLATE" = "reset",
	"WELCOME_TEMPLATE" = "welcome",
	"MAGIC_LOGIN_TEMPLATE" = "magiclogin",
}

export const EmailSubjects: Record<EmailSubject, string> = {
	RESET_PASSWORD: "Reset your password",
	WELCOME: "Welcome to the app",
	MAGIC_LOGIN: "Login to the app",
};

export enum FileSizes {
	IMAGE = 5 * 1024 * 1024, // 5MB
	DOC = 10 * 1024 * 1024, // 10MB
}

export enum PostState {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
}

export const FileTypes: Record<keyof typeof FileSizes, RegExp> = {
	IMAGE: new RegExp(/(jpg|jpeg|png|gif|svg)$/i),
	DOC: new RegExp(/(pdf|doc|txt|key|csv|docx|xls|xlsx|ppt|pptx)$/i),
};

// database enums

export enum CursorTypeEnum {
	DATE = "DATE",
	STRING = "STRING",
	NUMBER = "NUMBER",
}

export enum QueryCursorEnum {
	DATE = "DATE",
	ALPHA = "ALPHA",
}

export enum QueryOrderEnum {
	ASC = "ASC",
	DESC = "DESC",
}

export const enum RoutingKeys {
	SEND_MAIL = "send-mail",
}

export enum PaginationType {
	OFFSET = "offset",
	CURSOR = "cursor",
}
