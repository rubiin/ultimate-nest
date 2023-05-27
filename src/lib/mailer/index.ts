import { TemplateEngine } from "@common/@types";
import { NestConfigModule } from "@lib/config/config.module";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MailModule } from "./mailer.module";

@Global()
@Module({
	imports: [
		MailModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService<Configs, true>) => ({
				host: configService.get("mail.host", { infer: true }),
				port: configService.get("mail.port", { infer: true }),
				username: configService.get("mail.username", { infer: true }),
				password: configService.get("mail.password", { infer: true }),
				server: configService.get("mail.server", { infer: true }),
				previewEmail: configService.get("mail.previewEmail", { infer: true }),
				templateDir: configService.get("mail.templateDir", { infer: true }),
				templateEngine: {
					adapter: TemplateEngine.ETA,
					options: {
						rmWhitespace: true,
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
