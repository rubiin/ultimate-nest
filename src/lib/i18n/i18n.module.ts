import path from "node:path";

import process from "node:process";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { HelperService } from "@common/helpers";

@Module({
  imports: [
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        fallbackLanguage: "en",
        fallbacks: {
          "np-*": "np",
          "en-*": "en",
          "np_*": "np",
          "en_*": "en",
          "en": "en",
          "np": "np",
        },
        logging: true,
        loaderOptions: {
          path: path.join(__dirname, "../../resources/i18n/"),
          watch: true,
          includeSubfolders: true,
        },
        typesOutputPath: HelperService.isProd() ? undefined : path.join(`${process.cwd()}/src/generated/i18n-generated.ts`),
      }),
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
        new HeaderResolver(["x-lang"]),
      ],
    }),
  ],
  exports: [I18nModule],
})
export class NestI18nModule {}
