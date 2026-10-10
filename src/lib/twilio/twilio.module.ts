import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./twilio.module-definition";
import { TwilioService } from "./twilio.service";

@Module({
  exports: [TwilioService],
  providers: [TwilioService],
})
export class TwilioModule extends ConfigurableModuleClass {}
