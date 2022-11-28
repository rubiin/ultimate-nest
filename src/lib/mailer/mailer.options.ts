import { config } from "eta";

export interface MailModuleOptions {
	host?: string;
	port?: number;
	password: string;
	username: string;
	previewEmail: boolean;
	server: string;
	template: {
		dir: string;
		etaOptions: Partial<typeof config>;
	};
}
