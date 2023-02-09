import { resolve } from "node:path";

import aws from "@aws-sdk/client-ses";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { createTransport, SendMailOptions, Transporter } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/ses-transport";
import previewEmail from "preview-email";

import { EtaAdapter, HandlebarsAdapter, PugAdapter } from "./adapters";
import { IAdapter } from "./adapters/abstract.adapter";
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

		let adapter: IAdapter;

		// render template

		switch (this.options.engine.adapter) {
			case "pug": {
				adapter = new PugAdapter(this.options.engine.options);
				break;
			}
			case "eta": {
				adapter = new EtaAdapter(this.options.engine.options);
				break;
			}
			case "hbs": {
				adapter = new HandlebarsAdapter(this.options.engine.options);
				break;
			}
			default: {
				throw new Error("Invalid template engine");
			}
		}

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
