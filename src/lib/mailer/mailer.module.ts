import { Module, OnModuleInit } from "@nestjs/common";

import { ConfigurableModuleClass } from "./mail.module-definition";
import { MailerService } from "./mailer.service";
import { MailProcessor } from "./mail.processor";

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
