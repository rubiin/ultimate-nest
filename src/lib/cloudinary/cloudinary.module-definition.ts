import { ConfigurableModuleBuilder } from "@nestjs/common";

import { CloudinaryModuleOptions } from "./cloudinary.options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<CloudinaryModuleOptions>({
		moduleName: "CloudinaryModule",
	})
		.setClassMethodName("forRoot")
		.build();
