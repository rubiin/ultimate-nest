export enum Order {
	ASC = "ASC",
	DESC = "DESC",
}

export enum EmailTemplateEnum {
	"RESET_PASSWORD_TEMPLATE" = "reset",
	"WELCOME_TEMPLATE" = "welcome",
	"MAGIC_LOGIN" = "magiclogin",
}

export enum FileSizes {
	IMAGE = 5 * 1024 * 1024, // 5mb
}

export enum PostState {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
}

export const FileTypes = {
	IMAGE: /(jpg|jpeg|png|gif|svg)$/i,
} as const;
