import { resolve } from "node:path";

import * as aws from "@aws-sdk/client-ses";
import { Server } from "@common/@types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { SendMailOptions, Transporter } from "nodemailer";
import { createTransport } from "nodemailer";
import previewEmail from "preview-email";
import { from, retry, switchMap } from "rxjs";
import { BaseAdapter } from "./adapters/adapter";
import { MODULE_OPTIONS_TOKEN } from "./mail.module-definition";
import { MailModuleOptions } from "./mailer.options";

interface MailOptions extends Partial<SendMailOptions> {
  template: string
  replacements: Record<string, string>
}

@Injectable()
export class MailerService {
  readonly transporter: Transporter;
  private readonly logger: Logger = new Logger(MailerService.name);
  private readonly adapter: BaseAdapter;

  constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: MailModuleOptions,
  ) {
    // render template

    this.adapter = new BaseAdapter(this.options.templateEngine);

    // create Nodemailer SES transporter

    if (this.options.credentials.type === Server.SES) {
      const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: this.options.credentials.sesRegion,
        credentials: {
          accessKeyId: this.options.credentials.sesKey,
          secretAccessKey: this.options.credentials.sesAccessKey,
        },
      });

      this.transporter = createTransport({
        SES: { ses, aws },
        maxConnections: 14, // 14 is the maximum message rate per second for ses
      });
    }
    else {
      this.transporter = createTransport({
        pool: true,
        maxConnections: 5,
        host: this.options.credentials.host,
        port: this.options.credentials.port,
        secure: true,
        auth: {
          user: this.options.credentials.username,
          pass: this.options.credentials.password,
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
   * @param mailOptions - IMailOptions
   * @returns A promise that resolves to a boolean.
   */
  sendMail(mailOptions: MailOptions) {
    const templatePath = resolve("}");

    return from(this.adapter.compile(templatePath, mailOptions.replacements)).pipe(
      switchMap((html) => {
        mailOptions.html = html;

        if (this.options?.previewEmail) {
          try {
            (async () => await previewEmail(mailOptions))();
          }
          catch (error) {
            this.logger.error(error);
          }
        }

        return from(this.transporter.sendMail(mailOptions)).pipe(
          retry(this.options?.retryAttempts ?? 1),
        );
      }),
    );
  }

  async checkConnection() {
    return this.transporter.verify((error, _success) => {
      if (error)
        this.logger.log(error);
      else
        this.logger.log(`Mail server is ready to take our messages: ${_success}`);
    });
  }
}
