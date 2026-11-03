import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./twilio.module-definition.js";
import { TwilioService } from "./twilio.service.js";

@Module({
  exports: [TwilioService],
  providers: [TwilioService],
})
export class TwilioModule extends ConfigurableModuleClass {}
