import { config } from "eta";
import type { Options as PugOptions } from "pug";

export interface MailModuleOptions {
	host?: string;
	port?: number;
	password: string;
	username: string;
	previewEmail: boolean;
	server: string;
	templateDir: string;
	engine: {
		adapter: "eta" | "pug";
		options: Partial<typeof config> | PugOptions;
	};
}
