import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface FirebaseModuleOptions {
	FIREBASE_CREDENTIAL_PATH: string;
	FIREBASE_DATABASE_URL: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<FirebaseModuleOptions>({
		moduleName: "FirebaseModule",
	})
		.setExtras(
			{
				isGlobal: true,
			},
			(definition, extras) => ({
				...definition,
				global: extras.isGlobal,
			}),
		)
		.setClassMethodName("forRoot")
		.build();
