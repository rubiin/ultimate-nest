import { Global, Module } from '@nestjs/common';

import { twilioProvider } from './twilio.provider';

@Global()
@Module({
	providers: [twilioProvider],
	exports: [twilioProvider],
})
export class TwilioModule {}
