import { Logger } from '@nestjs/common';
import * as Twilio from 'twilio';
import { TwilioConfig } from './twilio.dto';

export class TwilioLibrary {
	client: Twilio.Twilio;

	private logger: Logger = new Logger('TwilioModule');

	constructor(readonly config: TwilioConfig) {
		this.client = Twilio(
			this.config.TWILIO_ACCOUNT_SID,
			this.config.TWILIO_AUTH_TOKEN,
		);
		this.logger.log('Twilio loaded');
	}

	async sendResetPasswordSMS(to: string, opt: any) {
		const { name, code } = opt;
		const message = `Hi, ${name}. Here is the code for resetting your password in our application: ${code}.`;

		return this.sendSMS(to, message);
	}

	async sendSampleSMS(to: string, opt: any) {
		const { name } = opt;
		const message = `Hi ${name}, Welcome to Nest Core Project`;

		return this.sendSMS(to, message);
	}

	private async sendSMS(to: string, body: string) {
		return this.client.messages.create({
			from: this.config.TWILIO_SMS_FROM,
			to,
			body,
		});
	}
}
