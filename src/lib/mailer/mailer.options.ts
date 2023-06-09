import { Server, TemplateEngine } from "@common/@types";
import { config } from "eta";
import type { Options as PugOptions } from "pug";

export interface MailModuleOptions {
	host?: string;
	port?: number;
	password?: string;
	username?: string;
	previewEmail: boolean;
	server: Server;
	sesKey?: string;
	sesAccessKey?: string;
	sesRegion?: string;
	templateDir: string;
	retryAttempts?: number;
	templateEngine:
		| {
				adapter: TemplateEngine.ETA;
				options: Partial<typeof config>;
		  }
		| {
				adapter: TemplateEngine.PUG;
				options: Partial<PugOptions>;
		  }
		| {
				adapter: TemplateEngine.HBS;
				options: Partial<CompileOptions>;
		  };
}
