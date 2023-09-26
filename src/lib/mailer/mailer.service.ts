import { resolve } from "node:path";

import * as aws from "@aws-sdk/client-ses";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { SendMailOptions, Transporter } from "nodemailer";
import { createTransport } from "nodemailer";
import previewEmail from "preview-email";
import { from, retry, switchMap } from "rxjs";
import { Server, TemplateEngine } from "@common/@types";
import { MailModuleOptions } from "./mailer.options";
import { MODULE_OPTIONS_TOKEN } from "./mail.module-definition";
import type { Adapter } from "./adapters/abstract.adapter";
import { EtaAdapter, HandlebarsAdapter, PugAdapter } from "./adapters";

interface MailOptions extends Partial<SendMailOptions> {
  template: string
  replacements: Record<string, any>
}

@Injectable()
export class MailerService {
  readonly transporter: Transporter;
  private readonly logger: Logger = new Logger(MailerService.name);
  private readonly adapter: Adapter;

  constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: MailModuleOptions,
  ) {
    // render template

    switch (this.options.templateEngine.adapter) {
      case TemplateEngine.PUG: {
        this.adapter = new PugAdapter({
          ...this.options.templateEngine.options,
          basedir: resolve(this.options.templateDir),
        });
        break;
      }
      case TemplateEngine.ETA: {
        this.adapter = new EtaAdapter({
          ...this.options.templateEngine.options,
          views: resolve(this.options.templateDir),
        });
        break;
      }
      case TemplateEngine.HBS: {
        this.adapter = new HandlebarsAdapter({ ...this.options.templateEngine.options });
        break;
      }
      default: {
        throw new Error("Invalid template engine");
      }
    }

    // create Nodemailer SES transporter

    if (this.options.server === Server.SES) {
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
        maxConnections: 14, // 14 is the maximum message rate per second for ses
      });
    }
    else {
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
   * @param mailOptions - IMailOptions
   * @returns A promise that resolves to a boolean.
   */
  sendMail(mailOptions: MailOptions) {
    const templatePath = resolve("}");

    return from(this.adapter.compile(templatePath, mailOptions.replacements)).pipe(
      switchMap((html) => {
        mailOptions.html = html;

        if (this.options.previewEmail === true) {
          previewEmail(mailOptions).catch((error) => {
            this.logger.error(error);
          });
        }

        return from(this.transporter.sendMail(mailOptions)).pipe(
          retry(this.options.retryAttempts),
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
