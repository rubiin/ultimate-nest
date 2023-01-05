import { ConfigurableModuleBuilder } from "@nestjs/common";

import { TwilioModuleOptions } from "./twilio.options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<TwilioModuleOptions>({
		moduleName: "TwilioModule",
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
