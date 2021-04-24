import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { MAIL_MODULE_OPTIONS } from './mailer.constants'; // the constant string/symbol/token
import { MailModuleOptions } from './mailer.options'; // the options to provide to the service
import { MailerService } from './mailer.service'; // the service to be provided to the rest of the server

@Module({
	providers: [MailerService],
	exports: [MailerService],
})
export class MailModule extends createConfigurableDynamicRootModule<
	MailModule,
	MailModuleOptions
>(MAIL_MODULE_OPTIONS) {
	static Deferred = MailModule.externallyConfigured(MailModule, 0);
}
