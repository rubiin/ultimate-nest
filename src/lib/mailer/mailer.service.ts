import { resolve } from "node:path";

import aws from "@aws-sdk/client-ses";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { createTransport, SendMailOptions, Transporter } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/ses-transport";
import previewEmail from "preview-email";

import { EtaAdapter, PugAdapter } from "./adapters";
import { MODULE_OPTIONS_TOKEN } from "./mail.module-definition";
import { MailModuleOptions } from "./mailer.options";

interface IMailOptions extends Partial<SendMailOptions> {
	template: string;
	replacements: Record<string, any>;
}

@Injectable()
export class MailerService {
	private readonly logger: Logger = new Logger(MailerService.name);

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: MailModuleOptions,
	) {}

	/**
	 * It takes a mailOptions object, renders the template, and sends the email
	 * @param {IMailOptions} mailOptions - IMailOptions
	 * @returns A promise that resolves to a boolean.
	 */
	async sendMail(mailOptions: IMailOptions) {
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

		// render template

		const adapter =
			this.options.engine.adapter === "eta"
				? new EtaAdapter(this.options.engine.options)
				: new PugAdapter(this.options.engine.options);

		const templatePath = resolve(
			`${__dirname}/../../${this.options.templateDir}/${mailOptions.template}.${this.options.engine.adapter}`,
		);

		const html = await adapter.compile(templatePath, mailOptions.replacements);

		mailOptions.html = html;

		if (this.options.previewEmail) {
			previewEmail(mailOptions).then(this.logger.log).catch(this.logger.error);
		}

		return transporter.sendMail(mailOptions);
	}
}
