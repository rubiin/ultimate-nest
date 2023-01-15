import path from "node:path";

import { Module } from "@nestjs/common";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";

@Module({
	imports: [
		I18nModule.forRoot({
			fallbackLanguage: "en",
			fallbacks: {
				"np-*": "np",
				"en-*": "en",
			},
			loaderOptions: {
				path: path.join(__dirname, "../../resources/i18n/"),
				watch: true,
				includeSubfolders: true,
			},
			typesOutputPath: path.join(process.cwd() + "/src/generated.ts"),
			resolvers: [
				new HeaderResolver(["x-custom-lang"]),
				AcceptLanguageResolver,
				{ use: QueryResolver, options: ["lang", "locale"] },
			],
		}),
	],
	exports: [I18nModule],
})
export class NestI18nModule {}
