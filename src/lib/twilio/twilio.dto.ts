import { IsNotEmpty, IsString } from 'class-validator';

export class TwilioConfig {
	@IsNotEmpty()
	@IsString()
	TWILIO_ACCOUNT_SID!: string;

	@IsNotEmpty()
	@IsString()
	TWILIO_AUTH_TOKEN!: string;

	@IsNotEmpty()
	@IsString()
	TWILIO_SMS_FROM!: string;
}
