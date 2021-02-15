import { Injectable } from '@nestjs/common';
import { createTransport, SendMailOptions } from 'nodemailer';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
	constructor(private readonly configService: ConfigService) {}

	private readonly logger: Logger = new Logger(MailerService.name);

	async sendMail(mailOptions: Partial<SendMailOptions>) {
		const transporter = createTransport({
			host: this.configService.get<string>('mail.host'),
			port: this.configService.get<number>('mail.port'),
			secure: false,
			auth: {
				user: this.configService.get<string>('mail.username'),
				pass: this.configService.get<string>('mail.password'),
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
