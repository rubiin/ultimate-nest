import { Module } from "@nestjs/common";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import path from "node:path";

@Module({
	imports: [
		I18nModule.forRoot({
			fallbackLanguage: "en",
			loaderOptions: {
				path: path.join(__dirname, "../../resources/i18n/"),
				watch: true,
			},
			disableMiddleware: true,
			resolvers: [
				new HeaderResolver(["x-custom-lang"]),
				AcceptLanguageResolver,
				{ use: QueryResolver, options: ["lang"] },
			],
		}),
	],
	exports: [I18nModule],
})
export class NestI18nModule {}
