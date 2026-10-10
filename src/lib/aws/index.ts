import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./aws.module";
import { AwsS3Service } from "./aws.s3.service";

@Module({
  exports: [AwsS3Service],
  providers: [AwsS3Service],
})
export class NestAwsModule extends ConfigurableModuleClass {}
