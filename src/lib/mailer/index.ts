import { Server } from "@common/@types";
import { TemplateEngine } from "@common/@types";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MailModule } from "./mailer.module";

@Global()
@Module({
  exports: [MailModule],
  imports: [
    MailModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        credentials: {
          host: configService.get("mail.host", { infer: true }),
          password: configService.get("mail.password", { infer: true }),
          port: configService.get("mail.port", { infer: true }),
          type: configService.get("mail.type", { infer: true }) as Server.SMTP,
          username: configService.get("mail.username", { infer: true }),
        },
        previewEmail: configService.get("mail.previewEmail", { infer: true }),
        templateDir: configService.get("mail.templateDir", { infer: true }),
        templateEngine: TemplateEngine.ETA,
      }),
    }),
  ],
})
export class NestMailModule {}
