import { ConfigurableModuleBuilder } from "@nestjs/common";

import { MailModuleOptions } from "./mailer.options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<MailModuleOptions>({
		moduleName: "MailModule",
	})
		.setClassMethodName("forRoot")
		.build();
