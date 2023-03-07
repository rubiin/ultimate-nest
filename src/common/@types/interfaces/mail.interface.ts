export interface IMailPayload {
	template: string;
	replacements?: Record<string, string>;
	to: string;
	subject: string;
	from: string;
}
