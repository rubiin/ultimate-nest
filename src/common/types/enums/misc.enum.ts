export enum Order {
	ASC = "ASC",
	DESC = "DESC",
}

export enum RandomTypes {
	NUMBER = "NUMBER",
	STRING = "STRING",
}

export enum EmailTemplateEnum {
	"RESET_PASSWORD_TEMPLATE" = "reset",
	"WELCOME_TEMPLATE" = "welcome",
}

export enum LoginType {
	PASSWORD = "PASSWORD",
	GOOGLE = "GOOGLE",
	FACEBOOK = "FACEBOOK",
}

export enum FileSizes {
	IMAGE = 5 * 1024 * 1000, // 5mb
}

export const FileTypes = {
	IMAGE: /(jpg|jpeg|png|gif)$/i,
};
