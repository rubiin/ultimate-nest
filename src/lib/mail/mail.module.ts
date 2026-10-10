import { HelperService } from "@common/helpers";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  FileMailTransport,
  FileTemplateEngine,
  MailModule,
  type MailTransport,
  SesTransport,
  SmtpTransport,
} from "@nestjs/mail";

import { NewsletterMail, ResetPasswordMail, VerifyEmailMail, WelcomeMail } from "./mails";

const mails = [NewsletterMail, ResetPasswordMail, VerifyEmailMail, WelcomeMail];

export const mailTransport = (config: ConfigService<Configs, true>): MailTransport => {
  // Preview writes `.eml` files instead of sending, so a dev box never reaches a real inbox.
  if (config.get("mail.previewEmail", { infer: true })) {
    return new FileMailTransport({ directory: "var/mail" });
  }

  if (config.get("mail.type", { infer: true }) === "SES") {
    return new SesTransport({
      region: config.get("mail.sesRegion", { infer: true }),
      credentials: {
        accessKeyId: config.get("mail.sesKey", { infer: true })!,
        secretAccessKey: config.get("mail.sesAccessKey", { infer: true })!,
      },
    });
  }

  const port = config.get("mail.port", { infer: true });

  return new SmtpTransport({
    host: config.get("mail.host", { infer: true }),
    port,
    secure: port === 465,
    auth: {
      user: config.get("mail.username", { infer: true })!,
      pass: config.get("mail.password", { infer: true })!,
    },
    pool: true,
  });
};

@Global()
@Module({
  exports: [MailModule, ...mails],
  imports: [
    MailModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configs, true>) => ({
        transport: mailTransport(config),
        templates: new FileTemplateEngine({
          dir: config.get("mail.templateDir", { infer: true }),
          layout: "layout",
          cache: HelperService.isProd(),
        }),
        from: config.get("mail.senderEmail", { infer: true }),
      }),
    }),
  ],
  providers: mails,
})
export class NestMailModule {}
