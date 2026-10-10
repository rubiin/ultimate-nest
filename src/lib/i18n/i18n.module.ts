import path from "node:path";

import { HelperService } from "@common/helpers";
import { Module } from "@nestjs/common";
import {
  AcceptLanguageLocaleResolver,
  HeaderLocaleResolver,
  I18nModule,
  JsonI18nLoader,
  QueryLocaleResolver,
} from "@nestjs/i18n";

@Module({
  exports: [I18nModule],
  imports: [
    I18nModule.forRoot({
      defaultLocale: "en",
      supportedLocales: ["en", "np"],
      fallbacks: { "en-US": "en", "en-GB": "en", "np-NP": "np" },
      missingKey: HelperService.isProd() ? "fallback" : "throw",
      loader: new JsonI18nLoader({
        path: path.join(__dirname, "../../resources/i18n/"),
        watch: !HelperService.isProd(),
      }),
      resolvers: [
        new QueryLocaleResolver("lang"),
        new AcceptLanguageLocaleResolver(),
        new HeaderLocaleResolver("x-lang"),
      ],
    }),
  ],
})
export class NestI18nModule {}
