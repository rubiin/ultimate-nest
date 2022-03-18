import { Inject, Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { Logger } from '@nestjs/common';
import { TwilioModuleOptions } from '@lib/twilio/twilio.options';
import { TWILIO_MODULE_OPTIONS } from '@lib/twilio/twilio.constant';

@Injectable()
export class TwilioService {
	constructor(
		@Inject(TWILIO_MODULE_OPTIONS)
		private readonly options: TwilioModuleOptions,
	) {}
	private readonly logger: Logger = new Logger(TwilioService.name);

	async sendSms(content: string, phone: string) {
		const client = twilio(this.options.accountSid, this.options.authToken);

		return new Promise<boolean>((resolve, reject) =>
			client.messages
				.create({
					body: content,
					from: this.options.from,
					to: `+977${phone}`,
				})
				.then(message => {
					this.logger.log(`Message sent ${message.sid}`);
					resolve(true);
				})
				.catch(error => {
					this.logger.error(error);
					reject(false);
				}),
		);
	}
}
