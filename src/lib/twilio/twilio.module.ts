import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Global, Module } from '@nestjs/common';
import { TWILIO_MODULE_OPTIONS } from './twilio.constant'; // the constant string/symbol/token
import { TwilioModuleOptions } from './twilio.options'; // the options to provide to the service
import { TwilioService } from './twilio.service'; // the service to be provided to the rest of the server

@Global()
@Module({
	providers: [TwilioService],
	exports: [TwilioService],
})
export class TwilioModule extends createConfigurableDynamicRootModule<
	TwilioModule,
	TwilioModuleOptions
>(TWILIO_MODULE_OPTIONS) {
	static Deferred = TwilioModule.externallyConfigured(TwilioModule, 0);
}
