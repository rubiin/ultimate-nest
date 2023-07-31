import path from "node:path";

import { Module } from "@nestjs/common";
import {
	AcceptLanguageResolver,
	CookieResolver,
	HeaderResolver,
	I18nModule,
	QueryResolver,
} from "nestjs-i18n";

@Module({
	imports: [
		I18nModule.forRoot({
			fallbackLanguage: "en",
			fallbacks: {
				"np-*": "np",
				"en-*": "en",
				"np_*": "np",
				"en_*": "en",
				en: "en",
				np: "np",
			},
			logging: true,
			loaderOptions: {
				path: path.join(__dirname, "../../resources/i18n/"),
				watch: true,
				includeSubfolders: true,
			},
      typesOutputPath: path.join(process.cwd() + "/src/generated/i18n-generated.ts"),
			resolvers: [
				new HeaderResolver(["x-custom-lang"]),
				AcceptLanguageResolver,
				new CookieResolver(),
				{ use: QueryResolver, options: ["lang", "locale"] },
			],
		}),
	],
	exports: [I18nModule],
})
export class NestI18nModule {}
