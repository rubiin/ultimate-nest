import { ConfigurableModuleBuilder } from "@nestjs/common";

import { FastJwtModuleOptions } from "./fast-jwt.options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<FastJwtModuleOptions>({
		moduleName: "FastJwtModule",
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
		.setClassMethodName("register")
		.build();
