import { expose } from 'threads/worker';

import * as eta from 'eta';
import { createTransport } from 'nodemailer';
import { Logger } from '@nestjs/common';

const logger: Logger = new Logger('SendMail');

const email = {
	async sendMail(
		to: string,
		mailTemplate: string,
		replacements: any,
		subject: string,
	) {
		return new Promise((resolve, reject) => {
			eta.renderFile(
				`${process.cwd()}/assets/${mailTemplate}`,
				replacements,
				{ cache: true },
				function (error, html) {
					if (error) {
						logger.error('error is ' + error);
						reject(false);
					}

					const transporter = createTransport({
						host: process.env.MAIL_HOST,
						port: Number.parseInt(process.env.MAIL_PORT),
						secure: false,
						auth: {
							user: process.env.MAIL_USER,
							pass: process.env.MAIL_PASSWORD,
						},
						tls: {
							// do not fail on invalid certs
							rejectUnauthorized: false,
						},
					});

					const mailOptions = {
						from: '"OrbisPay" <info@orbispay.me>',
						to,
						subject: subject,
						text: '',
						html,
					};

					transporter.sendMail(mailOptions, function (error, info) {
						if (error) {
							logger.error('error is ' + error);
							reject(false);
						} else {
							logger.log('info', 'Email sent: ' + info.response);
							resolve(true);
						}
					});
				},
			);
		});
	},
};

export type Email = typeof email;

expose(email);
