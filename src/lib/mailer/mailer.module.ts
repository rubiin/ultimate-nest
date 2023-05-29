import { Module, OnModuleInit } from "@nestjs/common";

import { ConfigurableModuleClass } from "./mail.module-definition";
import { MailProcessor } from "./mail.processor";
import { MailerService } from "./mailer.service";

@Module({
	providers: [MailerService, MailProcessor],
	exports: [MailerService, MailProcessor],
})
export class MailModule extends ConfigurableModuleClass implements OnModuleInit {
	constructor(private readonly mailService: MailerService) {
		super();
	}

	async onModuleInit() {
		await this.mailService.checkConnection();
	}
}
