import type { OnModuleInit } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { ConfigurableModuleClass } from "./mail.module-definition";
import { MailerService } from "./mailer.service";

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailModule extends ConfigurableModuleClass implements OnModuleInit {
  constructor(private readonly mailService: MailerService) {
    super();
  }

  async onModuleInit() {
    await this.mailService.checkConnection();
  }
}
