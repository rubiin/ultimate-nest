import  { AwsModuleOptions } from "./aws.interface"
import { ConfigurableModuleBuilder } from "@nestjs/common"


export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN }
    = new ConfigurableModuleBuilder<AwsModuleOptions>({
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
      .build()

