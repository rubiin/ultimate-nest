import { NestConfigModule } from "@lib/config/config.module";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MailModule } from "./mailer.module";

@Global()
@Module({
	imports: [
		MailModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
				host: configService.get<string>("mail.host"),
				port: configService.get<number>("mail.port"),
				username: configService.get<string>("mail.username"),
				password: configService.get<string>("mail.password"),
				server: configService.get<string>("mail.server"),
				previewEmail: configService.get<boolean>("mail.previewEmail", false),
				templateDir: configService.get<string>("mail.templateDir"),
				engine: {
					adapter: "eta",
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
