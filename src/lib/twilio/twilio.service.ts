import { TwilioModuleOptions } from "@lib/twilio/twilio.options";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { catchError, from, Observable, tap, throwError } from "rxjs";
import twilio from "twilio";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import { MODULE_OPTIONS_TOKEN } from "./twilio.module-definition";

@Injectable()
export class TwilioService {
	private readonly logger: Logger = new Logger(TwilioService.name);

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: TwilioModuleOptions,
	) {}

	/**
	 * It takes a content and a phone number as arguments, creates a Twilio client, and sends an SMS to the
	 * given phone number
	 * @param {string} content - The content of the SMS.
	 * @param {string} phone - The phone number to send the SMS to.
	 * @returns Observable<MessageInstance>
	 */
	sendSms(content: string, phone: string): Observable<MessageInstance> {
		const client = twilio(this.options.accountSid, this.options.authToken);

		return from(
			client.messages.create({
				body: content,
				from: this.options.from,
				to: `+977${phone}`,
			}),
		).pipe(
			tap(message => this.logger.log(`SMS sent to ${message.sid}`)),
			catchError(error => {
				this.logger.error(error);

				return throwError(() => error);
			}),
		);
	}
}
