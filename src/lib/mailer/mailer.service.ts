import { resolve } from "node:path";

import * as aws from "@aws-sdk/client-ses";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { createTransport, SendMailOptions, SentMessageInfo, Transporter } from "nodemailer";
import previewEmail from "preview-email";
import { from, switchMap } from "rxjs";

import { EtaAdapter, HandlebarsAdapter, PugAdapter } from "./adapters";
import { Adapter } from "./adapters/abstract.adapter";
import { MODULE_OPTIONS_TOKEN } from "./mail.module-definition";
import { MailModuleOptions } from "./mailer.options";

interface MailOptions extends Partial<SendMailOptions> {
	template: string;
	replacements: Record<string, any>;
}

@Injectable()
export class MailerService {
	readonly transporter: Transporter<SentMessageInfo>;
	private readonly logger: Logger = new Logger(MailerService.name);
	private readonly adapter: Adapter;

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: MailModuleOptions,
	) {
		// render template

		switch (this.options.engine.adapter) {
			case "pug": {
				this.adapter = new PugAdapter(this.options.engine.options);
				break;
			}
			case "eta": {
				this.adapter = new EtaAdapter(this.options.engine.options);
				break;
			}
			case "hbs": {
				this.adapter = new HandlebarsAdapter(this.options.engine.options);
				break;
			}
			default: {
				throw new Error("Invalid template engine");
			}
		}

		// create Nodemailer SES transporter

		if (this.options.server === "SES") {
			const ses = new aws.SES({
				apiVersion: "2010-12-01",
				region: this.options.sesRegion,
				credentials: {
					accessKeyId: this.options.sesKey,
					secretAccessKey: this.options.sesAccessKey,
				},
			});

			this.transporter = createTransport({
				SES: { ses, aws },
			});
		} else {
			this.transporter = createTransport({
				pool: true,
				maxConnections: 5,
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
	}

	/**
	 * It takes a mailOptions object, renders the template, and sends the email
	 * @param {MailOptions} mailOptions - IMailOptions
	 * @returns A promise that resolves to a boolean.
	 */
	sendMail(mailOptions: MailOptions) {
		const templatePath = resolve(
			`${__dirname}/../../${this.options.templateDir}/${mailOptions.template}.${this.options.engine.adapter}`,
		);

		return from(this.adapter.compile(templatePath, mailOptions.replacements)).pipe(
			switchMap(html => {
				mailOptions.html = html;

				if (this.options.previewEmail === true) {
					previewEmail(mailOptions).then(this.logger.log).catch(this.logger.error);
				}

				return from(this.transporter.sendMail(mailOptions));
			}),
		);
	}

	async checkConnection() {
		return this.transporter.verify((error, _success) => {
			if (error) {
				this.logger.log(error);
			} else {
				this.logger.log(`Mail server is ready to take our messages: ${_success}`);
			}
		});
	}
}
