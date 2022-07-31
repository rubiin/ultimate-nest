import { EtaConfig } from "eta/dist/types/config";

export interface MailModuleOptions {
	host: string;
	port: number;
	password: string;
	username: string;
	previewEmail: boolean;
	template: {
		dir: string;
		etaOptions: Partial<EtaConfig>;
	};
}
