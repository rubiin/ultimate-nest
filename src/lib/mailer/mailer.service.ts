import { Inject, Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions } from 'nodemailer';
import { Logger } from '@nestjs/common';
import { MAIL_MODULE_OPTIONS } from './mailer.constants';
import { MailModuleOptions } from './mailer.options';

@Injectable()
export class MailerService {
	constructor(
		@Inject(MAIL_MODULE_OPTIONS)
		private readonly options: MailModuleOptions,
	) {}
	private readonly logger: Logger = new Logger(MailerService.name);

	async sendMail(mailOptions: Partial<SendMailOptions>) {
		const transporter = createTransport({
			host: this.options.host,
			port: this.options.port,
			secure: false,
			auth: {
				user: this.options.username,
				pass: this.options.password,
			},
			tls: {
				// do not fail on invalid certs
				rejectUnauthorized: false,
			},
		});

		return new Promise<boolean>((resolve, reject) =>
			transporter.sendMail(mailOptions, async (error, info) => {
				if (error) {
					this.logger.error('error is ' + error);
					reject(false);
				} else {
					this.logger.log('info', 'Email sent: ' + info.response);
					resolve(true);
				}
			}),
		);
	}
}
