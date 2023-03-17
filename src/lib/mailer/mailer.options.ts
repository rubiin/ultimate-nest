import { config } from "eta";
import type { Options as PugOptions } from "pug";

export interface MailModuleOptions {
	host?: string;
	port?: number;
	password?: string;
	username?: string;
	previewEmail: boolean;
	server: string;
	sesKey?: string;
	sesAccessKey?: string;
	sesRegion?: string;
	templateDir: string;
	engine:
		| {
				adapter: "eta";
				options: Partial<typeof config>;
		  }
		| {
				adapter: "pug";
				options: Partial<PugOptions>;
		  }
		| {
				adapter: "hbs";
				options: Partial<CompileOptions>;
		  };
}
