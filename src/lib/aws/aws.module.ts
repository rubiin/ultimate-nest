import { ConfigurableModuleBuilder } from "@nestjs/common";

import { AwsModuleOptions } from "./aws.interface";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AwsModuleOptions>({
    moduleName: "AwsModule",
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
