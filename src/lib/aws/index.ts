import { Module } from "@nestjs/common";
import { ConfigurableModuleClass } from "./aws.module";
import { AwsS3Service } from "./aws.s3.service";

@Module({
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class NestAwsModule extends ConfigurableModuleClass { }
