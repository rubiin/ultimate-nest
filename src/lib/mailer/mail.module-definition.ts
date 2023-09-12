import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { MailModuleOptions } from "./mailer.options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN }
    = new ConfigurableModuleBuilder<MailModuleOptions>({
      moduleName: "MailModule",
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
