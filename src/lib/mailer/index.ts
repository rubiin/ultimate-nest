import { NestConfigModule } from "@lib/config/config.module";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailModule } from "./mailer.module";

@Global()
@Module({
	imports: [
		MailModule.forRootAsync(MailModule, {
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
				host: configService.get("mail.host"),
				port: configService.get<number>("mail.port"),
				username: configService.get("mail.username"),
				password: configService.get("mail.password"),
				previewEmail: configService.get<boolean>(
					"mail.previewEmail",
					false,
				),
				template: {
					dir: configService.get("mail.templateDir"),
					etaOptions: {
						cache: true,
					},
				},
			}),
			inject: [ConfigService],
		}),
	],
	exports: [MailModule],
})
export class NestMailModule {}
