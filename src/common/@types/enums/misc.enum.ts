export enum EmailTemplateEnum {
	"RESET_PASSWORD_TEMPLATE" = "reset",
	"WELCOME_TEMPLATE" = "welcome",
	"MAGIC_LOGIN_TEMPLATE" = "magiclogin",
}

type EmailSubjects = keyof typeof EmailTemplateEnum extends `${infer T}_TEMPLATE` ? T : never;

export const EmailSubjects: Record<EmailSubjects, string> = {
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
