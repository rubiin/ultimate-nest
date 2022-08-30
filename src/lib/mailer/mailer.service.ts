import { Inject, Injectable, Logger } from "@nestjs/common";
import * as eta from "eta";
import { createTransport, SendMailOptions, Transporter } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/ses-transport";
import previewEmail from "preview-email";
import { MAIL_MODULE_OPTIONS } from "./mailer.constants";
import { MailModuleOptions } from "./mailer.options";
import aws from "@aws-sdk/client-ses";

interface IMailOptions extends Partial<SendMailOptions> {
	template: string;
	replacements: Record<string, any>;
}

@Injectable()
export class MailerService {
	private readonly logger: Logger = new Logger(MailerService.name);

	constructor(
		@Inject(MAIL_MODULE_OPTIONS)
		private readonly options: MailModuleOptions,
	) {}

	/**
	 * It takes a mailOptions object, renders the template, and sends the email
	 * @param {IMailOptions} mailOptions - IMailOptions
	 * @returns A promise that resolves to a boolean.
	 */
	sendMail(mailOptions: IMailOptions) {
		let transporter: Transporter<SentMessageInfo>;

		// create Nodemailer SES transporter
		if (this.options.server === "SES") {
			const ses = new aws.SES({
				apiVersion: "2010-12-01",
				region: "ap-southeast-2",
				credentials: {
					accessKeyId: this.options.username,
					secretAccessKey: this.options.password,
				},
			});

			transporter = createTransport({
				SES: { ses, aws },
			});
		} else {
			transporter = createTransport({
				host: this.options.host,
				port: this.options.port,
				secure: true,
				auth: {
					user: this.options.username,
					pass: this.options.password,
				},
				tls: {
					// do not fail on invalid certs
					rejectUnauthorized: false,
				},
			});
		}

		return new Promise<boolean>((resolve, reject) =>
			eta.renderFile(
				`${__dirname}/../../${this.options.template.dir}/${mailOptions.template}.eta`,
				mailOptions.replacements,
				this.options.template.etaOptions,
				(error, html) => {
					if (error) {
						reject(error);
					}

					mailOptions.html = html;

					if (this.options.previewEmail) {
						previewEmail(mailOptions).then(console.info).catch(console.error);
					}

					transporter.sendMail(mailOptions, async (error, info) => {
						if (error) {
							this.logger.error("error is " + error);
							reject(false);
						} else {
							this.logger.debug("info", "Email sent: " + info.response);
							resolve(true);
						}
					});
				},
			),
		);
	}
}
