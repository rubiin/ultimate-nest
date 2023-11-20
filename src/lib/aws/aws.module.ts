import { ConfigurableModuleBuilder, Module } from "@nestjs/common";

import type { AwsModuleOptions } from "./aws.interface";
import { AwsS3Service } from "./aws.s3.service";

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
      .build();

@Module({
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class NestAwsModule extends ConfigurableModuleClass {}
