import path from "node:path";

import { HelperService } from "@common/helpers";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";

// Chokidar keeps file handles open and blocks a clean exit, and per-translation logging is
// noise once nobody reads it — both are development aids, so production turns them off.
export const i18nOptions = () => {
  const isProd = HelperService.isProd();

  return {
    fallbackLanguage: "en",
    fallbacks: {
      "np-*": "np",
      "en-*": "en",
      "np_*": "np",
      "en_*": "en",
      en: "en",
      np: "np",
    },
    logging: !isProd,
    loaderOptions: {
      path: path.join(__dirname, "../../resources/i18n/"),
      watch: !isProd,
      includeSubfolders: true,
    },
  };
};

@Module({
  exports: [I18nModule],
  imports: [
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
        new HeaderResolver(["x-lang"]),
      ],
      useFactory: i18nOptions,
    }),
  ],
})
export class NestI18nModule {}
