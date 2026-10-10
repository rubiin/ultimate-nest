import { relative, resolve } from "node:path";
import process from "node:process";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { Server } from "@common/@types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { SendMailOptions, Transporter } from "nodemailer";
import { createTransport } from "nodemailer";
import previewEmail from "preview-email";
import { from, retry, switchMap } from "rxjs";

import { BaseAdapter } from "./adapters/adapter";
import { MODULE_OPTIONS_TOKEN } from "./mail.module-definition";
import type { MailModuleOptions } from "./mailer.options";

interface MailOptions extends SendMailOptions {
  template: string;
  replacements: Record<string, string>;
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
      const sesClient = new SESv2Client({
        apiVersion: "2010-12-01",
        credentials: {
          accessKeyId: this.options.credentials.sesKey,
          secretAccessKey: this.options.credentials.sesAccessKey,
        },
        region: this.options.credentials.sesRegion,
      });

      this.transporter = createTransport({
        SES: { SendEmailCommand, sesClient },
      });
    } else {
      this.transporter = createTransport({
        auth: {
          pass: this.options.credentials.password,
          user: this.options.credentials.username,
        },
        host: this.options.credentials.host,
        maxConnections: 5,
        pool: true,
        port: this.options.credentials.port,
        secure: true,
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
    // consolidate's eta engine resolves templates against `views: "."`, so the path has to be
    // relative to the working directory.
    const templatePath = relative(
      process.cwd(),
      resolve(this.options.templateDir, `${mailOptions.template}.${this.options.templateEngine}`),
    );

    return from(this.adapter.compile(templatePath, mailOptions.replacements)).pipe(
      switchMap((html) => {
        mailOptions.html = html;

        if (this.options?.previewEmail) {
          try {
            (async () => previewEmail(mailOptions as Parameters<typeof previewEmail>[0]))();
          } catch (error) {
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
      if (error) this.logger.log(error);
      else this.logger.log(`Mail server is ready to take our messages: ${_success}`);
    });
  }
}
